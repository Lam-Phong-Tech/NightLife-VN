const HOME_EVENTS_KEY = "nightlife_home_behavior";
const HOT_VIDEO_LIKES_KEY = "nightlife_home_video_likes";
const HOT_VIDEO_VIEWS_KEY = "nightlife_home_video_views";
const ANONYMOUS_ID_KEY = "nightlife_anonymous_id";
const MAX_EVENTS = 36;

type HomeBehaviorEvent = {
  storeId?: string;
  storeSlug?: string;
  category?: string;
  source: string;
  createdAt: string;
};

type TrackHomeVenueInput = {
  storeId?: string;
  storeSlug?: string;
  category?: string;
  source?: string;
};

const canUseStorage = () => typeof window !== "undefined" && Boolean(window.localStorage);

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Browser storage can be unavailable in private mode; tracking is best effort.
  }
}

export function getHomeAnonymousId() {
  if (!canUseStorage()) return undefined;

  const existing = window.localStorage.getItem(ANONYMOUS_ID_KEY);
  if (existing) return existing;

  const generated =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? `anon_${crypto.randomUUID()}`
      : `anon_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(ANONYMOUS_ID_KEY, generated);
  return generated;
}

export function trackHomeVenueSignal(input: TrackHomeVenueInput) {
  if (!input.storeSlug && !input.category) return;

  const events = readJson<HomeBehaviorEvent[]>(HOME_EVENTS_KEY, []);
  const nextEvents: HomeBehaviorEvent[] = [
    {
      storeId: input.storeId,
      storeSlug: input.storeSlug,
      category: input.category,
      source: input.source ?? "home",
      createdAt: new Date().toISOString(),
    },
    ...events,
  ].slice(0, MAX_EVENTS);

  writeJson(HOME_EVENTS_KEY, nextEvents);
}

export function getHomeBehaviorSignals() {
  const events = readJson<HomeBehaviorEvent[]>(HOME_EVENTS_KEY, []);
  const categories = Array.from(
    new Set(events.map((event) => event.category).filter((value): value is string => Boolean(value))),
  ).slice(0, 6);
  const storeSlugs = Array.from(
    new Set(events.map((event) => event.storeSlug).filter((value): value is string => Boolean(value))),
  ).slice(0, 10);

  return {
    categories,
    storeSlugs,
    anonymousId: getHomeAnonymousId(),
  };
}

export function hasLikedHotVideo(mediaId: string) {
  return readJson<string[]>(HOT_VIDEO_LIKES_KEY, []).includes(mediaId);
}

export function rememberHotVideoLike(mediaId: string) {
  const liked = readJson<string[]>(HOT_VIDEO_LIKES_KEY, []);
  if (liked.includes(mediaId)) return;
  writeJson(HOT_VIDEO_LIKES_KEY, [mediaId, ...liked].slice(0, 80));
}

export function shouldTrackHotVideoView(mediaId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const views = readJson<Record<string, string>>(HOT_VIDEO_VIEWS_KEY, {});
  if (views[mediaId] === today) return false;

  writeJson(HOT_VIDEO_VIEWS_KEY, { ...views, [mediaId]: today });
  return true;
}
