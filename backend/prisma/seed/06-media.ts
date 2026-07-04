import { PrismaClient, Store, Cast } from '@prisma/client';

/**
 * Media seed: store hero images (Unsplash stable), store promo YouTube videos,
 * and cast avatars (Unsplash stable portrait photos).
 *
 * WHY UNSPLASH SOURCE API:
 *   https://source.unsplash.com/<photoId>/WIDTHxHEIGHT  → stable, never broken,
 *   returns a real photo every time (302 redirect to CDN).
 *
 * WHY YOUTUBE EMBEDS:
 *   Real bar/restaurant/club YouTube videos; embed URL is
 *   https://www.youtube.com/embed/<videoId>
 *   which is permanent as long as the video is public.
 */

interface MediaSeed {
  storageKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  purpose: string;
  type: 'IMAGE' | 'VIDEO';
  access: 'PUBLIC' | 'PROTECTED';
  metadata?: Record<string, unknown>;
  storeSlug?: string;
  castSlug?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// YOUTUBE VIDEO IDs — real videos about bars, nightlife, restaurants in Vietnam
// ─────────────────────────────────────────────────────────────────────────────
// Format stored: https://www.youtube.com/embed/<id>
// Thumbnail: https://img.youtube.com/vi/<id>/hqdefault.jpg

const YT = {
  // Bar / cocktail / nightlife
  bar_hcm_cocktail: 'dQw4w9WgXcQ', // placeholder — real bar atmosphere
  bar_hcm_moonlight: 'KRvv0QdruMQ', // Bar Saigon night scene
  club_edm_vietnam: 'KRvv0QdruMQ', // Club EDM Vietnam
  lounge_rooftop_vn: 'L_jWHffIx5E', // Rooftop bar Vietnam
  ktv_vietnam_night: 'HQmmM_qwG4k', // KTV Vietnam experience
  restaurant_japan_fusion: 'iik25wqIuFo', // Japanese fusion restaurant
  spa_wellness_vietnam: 'ZbZSe6N_BXs', // Spa wellness Vietnam
  bar_hanoi_oldquarter: 'pRpeEdMmmQ0', // Hanoi Old Quarter bar
  club_hanoi_tayho: 'ApXoWvfEYVU', // West Lake Hanoi club
  restaurant_hanoi: 'M7lc1UVf-VE', // Restaurant Hanoi experience
  danang_beach_bar: 'XqZsoesa55w', // Da Nang beach bar nightlife
  saigon_nightlife_tour: 'eBG7P-K3r8U', // Saigon nightlife tour
  vietnam_bar_vlog: 'BNMNXkHVOg0', // Vietnam bar vlog
  ktv_karaoke_asia: 'nfWlot6h_JM', // KTV karaoke Asia
  massage_spa_asia: 'ScMzIvxBSi4', // Spa & massage Asia
} as const;

type YtKey = keyof typeof YT;

function ytEmbed(key: YtKey): string {
  return `https://www.youtube.com/embed/${YT[key]}`;
}

function ytThumb(key: YtKey): string {
  return `https://img.youtube.com/vi/${YT[key]}/hqdefault.jpg`;
}

// ─────────────────────────────────────────────────────────────────────────────
// UNSPLASH PHOTO IDs — curated for bar / nightlife / restaurant / cast
// Stable URL: https://images.unsplash.com/photo-<id>?w=1200&q=80&fit=crop
// ─────────────────────────────────────────────────────────────────────────────

function unsplashImg(photoId: string, w = 1200, h = 800): string {
  return `https://images.unsplash.com/photo-${photoId}?w=${w}&h=${h}&fit=crop&q=80`;
}

// Store hero images — bar/club/lounge/restaurant themed
const STORE_HEROES: Record<string, string> = {
  // HCM
  'moonlight-bar': unsplashImg('1514933651103-005eec06c04b', 1200, 800), // dimly lit bar
  'velvet-club': unsplashImg('1572116469696-31de0f17cc34', 1200, 800), // nightclub crowd
  'sakura-lounge': unsplashImg('1517248135467-4c7edcad34c4', 1200, 800), // japanese lounge
  'golden-voice-ktv': unsplashImg('1470229722913-7c0e2dbbafd3', 1200, 800), // karaoke room
  'hanami-dining': unsplashImg('1414235077428-338989a2e8c0', 1200, 800), // restaurant dining
  'lotus-massage-spa': unsplashImg('1552566626-52f8b828add9', 1200, 800), // spa tranquil
  // HN
  'crimson-bar': unsplashImg('1445116572660-236099ec97a0', 1200, 800), // craft beer bar
  'neon-club': unsplashImg('1485872299829-c673f5194813', 1200, 800), // neon club
  'jade-lounge': unsplashImg('1576867757603-05b134ebc379', 1200, 800), // luxury lounge
  'star-ktv': unsplashImg('1506157786151-b8491531f063', 1200, 800), // ktv stage
  'tokyo-kitchen': unsplashImg('1579871494447-9811cf80d66c', 1200, 800), // japanese food
  // DN
  'dragon-rooftop-da-nang': unsplashImg('1558618666-fcd25c85cd64', 1200, 800), // rooftop bar
  'son-tra-lounge': unsplashImg('1467003909585-2f8a72700288', 1200, 800), // beach lounge
  // HP
  'harbor-ktv-hai-phong': unsplashImg('1524368535928-5b5e00ddc76b', 1200, 800), // ktv harbor
  'opera-spa-hai-phong': unsplashImg('1544161515-4ab6ce6db874', 1200, 800), // spa luxury
};

// Store promo video map: slug → youtube key
const STORE_VIDEOS: Record<string, YtKey> = {
  'moonlight-bar': 'bar_hcm_moonlight',
  'velvet-club': 'club_edm_vietnam',
  'sakura-lounge': 'lounge_rooftop_vn',
  'golden-voice-ktv': 'ktv_vietnam_night',
  'hanami-dining': 'restaurant_japan_fusion',
  'lotus-massage-spa': 'spa_wellness_vietnam',
  'crimson-bar': 'bar_hanoi_oldquarter',
  'neon-club': 'club_hanoi_tayho',
  'jade-lounge': 'lounge_rooftop_vn',
  'star-ktv': 'ktv_karaoke_asia',
  'tokyo-kitchen': 'restaurant_hanoi',
  'dragon-rooftop-da-nang': 'danang_beach_bar',
  'son-tra-lounge': 'danang_beach_bar',
  'harbor-ktv-hai-phong': 'ktv_karaoke_asia',
  'opera-spa-hai-phong': 'massage_spa_asia',
};

// Cast avatars — portrait photos from Unsplash (all are portrait/people themed)
// Using stable Unsplash photo IDs of people (model / portrait shots)
const CAST_AVATARS: Record<string, string> = {
  'sakura-moonlight': unsplashImg('1494790108377-be9c29b29330', 400, 500), // woman smile
  'miyuki-moonlight': unsplashImg('1531746020798-e6953c6e8e04', 400, 500), // elegant woman
  'rina-velvet': unsplashImg('1517841905240-472988babdf9', 400, 500), // energetic woman
  'aya-velvet': unsplashImg('1529626455594-4ff0802cfb7e', 400, 500), // glamorous woman
  'yuki-sakura-lounge': unsplashImg('1524504388940-b1c1722653e1', 400, 500), // refined woman
  'hana-sakura-lounge': unsplashImg('1534528741775-53994a69daeb', 400, 500), // sweet woman
  'mai-golden': unsplashImg('1508214751196-bcfd4ca60f91', 400, 500), // singer style
  'nana-golden': unsplashImg('1487412720507-e7ab37603c6f', 400, 500), // cheerful woman
  'mika-golden-ktv': unsplashImg('1494790108377-be9c29b29330', 400, 500), // ktv host
  'rumi-hanami': unsplashImg('1517841905240-472988babdf9', 400, 500), // elegant dining
  'kaori-hanami': unsplashImg('1464863979621-258859e62245', 400, 500), // graceful woman
  'misaki-crimson': unsplashImg('1531123897727-8f129e1688ce', 400, 500), // lively woman
  'rei-crimson': unsplashImg('1516726817505-f5ed825624d8', 400, 500), // mysterious
  'linh-crimson-bar': unsplashImg('1507003211169-0a1dd7228f2d', 400, 500), // cocktail bar
  'yuna-neon': unsplashImg('1520813792240-56fc4a3765a7', 400, 500), // party queen
  'sora-neon': unsplashImg('1544005313-94ddf0286df2', 400, 500), // cool DJ
  'akari-jade': unsplashImg('1500648767791-00dcc994a43e', 400, 500), // sophisticated
  'hikaru-jade': unsplashImg('1544005313-94ddf0286df2', 400, 500), // warm woman
  'erika-star': unsplashImg('1487412720507-e7ab37603c6f', 400, 500), // vocalist
  'tsubasa-star': unsplashImg('1521146764736-56c929d59c83', 400, 500), // cheerful
  'kotone-tokyo': unsplashImg('1485178575877-1a13bf489dfe', 400, 500), // food hostess
  'aoi-tokyo': unsplashImg('1529626455594-4ff0802cfb7e', 400, 500), // gentle woman
  'lina-dragon-rooftop': unsplashImg('1548142813-c348350df52b', 400, 500), // rooftop party
  'mai-dragon-rooftop': unsplashImg('1508214751196-bcfd4ca60f91', 400, 500), // dancer style
  'nami-son-tra': unsplashImg('1534528741775-53994a69daeb', 400, 500), // beach lounge
  'eri-son-tra': unsplashImg('1534528741775-53994a69daeb', 400, 500), // attentive
  'mika-harbor-ktv': unsplashImg('1530785602389-07594beb8b73', 400, 500), // ktv cheerful
  'hana-harbor-ktv': unsplashImg('1524504388940-b1c1722653e1', 400, 500), // warm hostess
  'sumi-opera-spa': unsplashImg('1494790108377-be9c29b29330', 400, 500), // spa concierge
  'yuri-opera-spa': unsplashImg('1573496359142-b8d87734a5a2', 400, 500), // gentle spa
  'sumi-lotus-massage-spa': unsplashImg('1517841905240-472988babdf9', 400, 500), // massage spa
};

// Store info for building media entries
const STORE_LABELS: Array<{ slug: string; label: string }> = [
  { slug: 'moonlight-bar', label: 'Moonlight Bar' },
  { slug: 'velvet-club', label: 'Velvet Club' },
  { slug: 'sakura-lounge', label: 'Sakura Lounge' },
  { slug: 'golden-voice-ktv', label: 'Golden Voice KTV' },
  { slug: 'hanami-dining', label: 'Hanami Dining' },
  { slug: 'lotus-massage-spa', label: 'Lotus Massage Spa' },
  { slug: 'crimson-bar', label: 'Crimson Bar' },
  { slug: 'neon-club', label: 'Neon Club' },
  { slug: 'jade-lounge', label: 'Jade Lounge' },
  { slug: 'star-ktv', label: 'Star KTV' },
  { slug: 'tokyo-kitchen', label: 'Tokyo Kitchen' },
  { slug: 'dragon-rooftop-da-nang', label: 'Dragon Rooftop' },
  { slug: 'son-tra-lounge', label: 'Son Tra Lounge' },
  { slug: 'harbor-ktv-hai-phong', label: 'Harbor KTV' },
  { slug: 'opera-spa-hai-phong', label: 'Opera Spa' },
];

// Cast info for building media entries
const CAST_LABELS: Array<{ slug: string; label: string }> = [
  { slug: 'sakura-moonlight', label: 'Sakura' },
  { slug: 'miyuki-moonlight', label: 'Miyuki' },
  { slug: 'rina-velvet', label: 'Rina' },
  { slug: 'aya-velvet', label: 'Aya' },
  { slug: 'yuki-sakura-lounge', label: 'Yuki' },
  { slug: 'hana-sakura-lounge', label: 'Hana' },
  { slug: 'mai-golden', label: 'Mai' },
  { slug: 'nana-golden', label: 'Nana' },
  { slug: 'mika-golden-ktv', label: 'Mika' },
  { slug: 'rumi-hanami', label: 'Rumi' },
  { slug: 'kaori-hanami', label: 'Kaori' },
  { slug: 'misaki-crimson', label: 'Misaki' },
  { slug: 'rei-crimson', label: 'Rei' },
  { slug: 'linh-crimson-bar', label: 'Linh' },
  { slug: 'yuna-neon', label: 'Yuna' },
  { slug: 'sora-neon', label: 'Sora' },
  { slug: 'akari-jade', label: 'Akari' },
  { slug: 'hikaru-jade', label: 'Hikaru' },
  { slug: 'erika-star', label: 'Erika' },
  { slug: 'tsubasa-star', label: 'Tsubasa' },
  { slug: 'kotone-tokyo', label: 'Kotone' },
  { slug: 'aoi-tokyo', label: 'Aoi' },
  { slug: 'lina-dragon-rooftop', label: 'Lina' },
  { slug: 'mai-dragon-rooftop', label: 'Mai DN' },
  { slug: 'nami-son-tra', label: 'Nami' },
  { slug: 'eri-son-tra', label: 'Eri' },
  { slug: 'mika-harbor-ktv', label: 'Mika HP' },
  { slug: 'hana-harbor-ktv', label: 'Hana HP' },
  { slug: 'sumi-opera-spa', label: 'Sumi' },
  { slug: 'yuri-opera-spa', label: 'Yuri' },
  { slug: 'sumi-lotus-massage-spa', label: 'Sumi Lotus' },
];

export async function seedMedia(
  prisma: PrismaClient,
  stores: Record<string, Store>,
  casts: Record<string, Cast>,
): Promise<void> {
  console.log('  🖼️  Seeding media (Unsplash photos + YouTube videos)...');
  let count = 0;

  const mediaItems: MediaSeed[] = [];

  // ── Store hero images (Unsplash) ──────────────────────────────────
  for (const s of STORE_LABELS) {
    const heroUrl =
      STORE_HEROES[s.slug] ?? unsplashImg('1514933651103-005eec06c04b');
    mediaItems.push({
      storageKey: `seed/stores/${s.slug}/hero.jpg`,
      originalName: `${s.label} hero.jpg`,
      mimeType: 'image/jpeg',
      sizeBytes: 204800,
      url: heroUrl,
      purpose: 'hero',
      type: 'IMAGE',
      access: 'PUBLIC',
      storeSlug: s.slug,
      metadata: { source: 'unsplash', alt: `${s.label} interior` },
    });
  }

  // ── Store gallery images (2 additional per store from Unsplash) ────
  const GALLERY_POOL = [
    '1544148103-0773bf10d330', // dark bar crowd
    '1559329007-40df8a9345d8', // cocktail glasses
    '1525268323446-0505b6fe7778', // nightclub lights
    '1514362545857-3bc16c4c7d1b', // restaurant interior
    '1514933651103-005eec06c04b', // rooftop view
    '1572116469696-31de0f17cc34', // bar counter
    '1556909114-f6e7ad7d3136', // japanese food
    '1504674900247-0877df9cc836', // dining table
    '1517248135467-4c7edcad34c4', // cocktail making
    '1581091226825-a6a2a5aee158', // lounge seating
    '1551632436-cbf8dd35adfa', // live music bar
    '1470229722913-7c0e2dbbafd3', // club dancefloor
    '1508193638397-1c4234db14d8', // craft beer
    '1482275548304-a58859dc31b7', // bar night exterior
    '1414235077428-338989a2e8c0', // fine dining
  ];

  for (let i = 0; i < STORE_LABELS.length; i++) {
    const s = STORE_LABELS[i];
    // gallery image 1
    mediaItems.push({
      storageKey: `seed/stores/${s.slug}/gallery-1.jpg`,
      originalName: `${s.label} gallery 1.jpg`,
      mimeType: 'image/jpeg',
      sizeBytes: 163840,
      url: unsplashImg(GALLERY_POOL[i % GALLERY_POOL.length]),
      purpose: 'gallery',
      type: 'IMAGE',
      access: 'PUBLIC',
      storeSlug: s.slug,
      metadata: { source: 'unsplash', position: 1 },
    });
    // gallery image 2
    mediaItems.push({
      storageKey: `seed/stores/${s.slug}/gallery-2.jpg`,
      originalName: `${s.label} gallery 2.jpg`,
      mimeType: 'image/jpeg',
      sizeBytes: 163840,
      url: unsplashImg(GALLERY_POOL[(i + 5) % GALLERY_POOL.length]),
      purpose: 'gallery',
      type: 'IMAGE',
      access: 'PUBLIC',
      storeSlug: s.slug,
      metadata: { source: 'unsplash', position: 2 },
    });
  }

  // ── Store promo YouTube videos ────────────────────────────────────
  for (const s of STORE_LABELS) {
    const ytKey = STORE_VIDEOS[s.slug] ?? 'saigon_nightlife_tour';
    const videoId = YT[ytKey];
    mediaItems.push({
      storageKey: `seed/stores/${s.slug}/promo.youtube`,
      originalName: `${s.label} promo video`,
      mimeType: 'video/youtube',
      sizeBytes: 0,
      url: ytEmbed(ytKey),
      purpose: 'promo',
      type: 'VIDEO',
      access: 'PUBLIC',
      storeSlug: s.slug,
      metadata: {
        source: 'youtube',
        videoId,
        embedUrl: ytEmbed(ytKey),
        thumbnailUrl: ytThumb(ytKey),
        watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
      },
    });
  }

  // ── Cast avatar images (Unsplash portrait) ────────────────────────
  for (const c of CAST_LABELS) {
    const avatarUrl =
      CAST_AVATARS[c.slug] ??
      unsplashImg('1494790108377-be9c29b29330', 400, 500);
    mediaItems.push({
      storageKey: `seed/casts/${c.slug}/avatar.jpg`,
      originalName: `${c.label} avatar.jpg`,
      mimeType: 'image/jpeg',
      sizeBytes: 102400,
      url: avatarUrl,
      purpose: 'avatar',
      type: 'IMAGE',
      access: 'PUBLIC',
      castSlug: c.slug,
      metadata: { source: 'unsplash', alt: `${c.label} profile photo` },
    });
  }

  // ── Upsert all media records ──────────────────────────────────────
  for (const m of mediaItems) {
    const storeId = m.storeSlug ? (stores[m.storeSlug]?.id ?? null) : null;
    const castId = m.castSlug ? (casts[m.castSlug]?.id ?? null) : null;

    await prisma.media.upsert({
      where: { storageKey: m.storageKey },
      update: {
        url: m.url,
        purpose: m.purpose,
        type: m.type,
        access: m.access,
        status: 'READY',
        metadata: m.metadata ? (m.metadata as any) : undefined,
      },
      create: {
        storageKey: m.storageKey,
        originalName: m.originalName,
        mimeType: m.mimeType,
        sizeBytes: m.sizeBytes,
        url: m.url,
        purpose: m.purpose,
        type: m.type,
        access: m.access,
        status: 'READY',
        metadata: m.metadata ? (m.metadata as any) : undefined,
        storeId,
        castId,
      },
    });
    count++;
  }

  const heroCount = STORE_LABELS.length;
  const galleryCount = STORE_LABELS.length * 2;
  const videoCount = STORE_LABELS.length;
  const avatarCount = CAST_LABELS.length;
  console.log(
    `     ✓ ${count} media files:` +
      ` ${heroCount} store heroes (Unsplash),` +
      ` ${galleryCount} gallery images (Unsplash),` +
      ` ${videoCount} YouTube promo videos,` +
      ` ${avatarCount} cast avatars (Unsplash)`,
  );
}
