export const normalizeMediaKey = (value?: string | null): string => {
  const url = value?.trim();
  if (!url) return '';
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./i, '').toLowerCase();
    const youtubeId =
      host === 'youtu.be'
        ? parsed.pathname.split('/').filter(Boolean)[0]
        : host.endsWith('youtube.com')
          ? parsed.searchParams.get('v') ||
            parsed.pathname.match(/\/(?:embed|shorts|live)\/([^/?#]+)/)?.[1]
          : '';
    if (youtubeId) return `youtube:${youtubeId.toLowerCase()}`;
    parsed.hash = '';
    parsed.pathname = parsed.pathname.replace(/\/+$/g, '');
    return parsed.toString().toLowerCase();
  } catch {
    return url.toLowerCase();
  }
};

export const mediaItemUrl = (item: any): string =>
  item?.url || item?.thumb || item?.title || '';

export const dedupeMediaItems = <T extends Record<string, any>>(items: T[]): T[] => {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = normalizeMediaKey(mediaItemUrl(item)) || String(item?.id || '');
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const MENU_MEDIA_PURPOSE_KEYS = new Set([
  'menu',
  'menu-item',
  'menu_item',
  'store-menu-item',
  'store_menu_item',
  'partner-menu-item',
  'partner_menu_item',
]);

export const extractMenuImageKeysAndIds = (pricingInfo: any): Set<string> => {
  const keysAndIds = new Set<string>();
  if (!pricingInfo) return keysAndIds;

  const rawGroups = Array.isArray(pricingInfo?.groups) ? pricingInfo.groups : [];
  const rawItems = Array.isArray(pricingInfo?.items) ? pricingInfo.items : [];
  const groups = rawGroups.length
    ? rawGroups
    : rawItems.length
      ? [{ items: rawItems }]
      : [];

  for (const group of groups) {
    const items = Array.isArray(group?.items) ? group.items : [];
    for (const item of items) {
      if (item?.mediaId) {
        keysAndIds.add(String(item.mediaId).trim());
      }
      const url = String(item?.thumb || item?.imageUrl || item?.url || '').trim();
      if (url) {
        keysAndIds.add(url);
        const key = normalizeMediaKey(url);
        if (key) keysAndIds.add(key);
      }
    }
  }

  return keysAndIds;
};

export const isMenuMediaItem = (
  media: any,
  menuKeysAndIds: Set<string>,
): boolean => {
  if (!media) return false;

  const purpose = String(media?.purpose ?? '').trim().toLowerCase();
  if (purpose && MENU_MEDIA_PURPOSE_KEYS.has(purpose)) {
    return true;
  }

  const mediaId = String(media?.id ?? '').trim();
  if (mediaId && menuKeysAndIds.has(mediaId)) {
    return true;
  }

  const url = String(media?.url || media?.thumb || '').trim();
  if (url && (menuKeysAndIds.has(url) || menuKeysAndIds.has(normalizeMediaKey(url)))) {
    return true;
  }

  return false;
};

export const filterStoreAlbumMedia = (
  storeMediaList: any[],
  pricingInfo: any,
) => {
  const storeMedia = (Array.isArray(storeMediaList) ? storeMediaList : []).filter(
    (m: any) => !m.castId,
  );
  const imageMedia = dedupeMediaItems(
    storeMedia.filter((m: any) => m.type === 'IMAGE'),
  );
  const menuKeysAndIds = extractMenuImageKeysAndIds(pricingInfo);

  const nonMenuImages = imageMedia.filter(
    (m: any) => !isMenuMediaItem(m, menuKeysAndIds),
  );

  const cover =
    nonMenuImages.find((m: any) =>
      ['store-hero', 'STORE_COVER', 'COVER_IMAGE'].includes(m.purpose),
    ) || nonMenuImages[0] || null;

  const coverKey = normalizeMediaKey(mediaItemUrl(cover));
  const galleryMedia = nonMenuImages.filter(
    (m: any) => normalizeMediaKey(mediaItemUrl(m)) !== coverKey,
  );

  return { cover, galleryMedia };
};
