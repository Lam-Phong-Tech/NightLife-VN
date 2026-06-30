import { PrismaClient, Store, Cast } from '@prisma/client';

/**
 * Demo media: store hero images, store promo videos, and cast avatars.
 * Uses project-local image URLs and stock-style video URLs for demo media.
 */

interface MediaSeed {
  storageKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  purpose: string;
  type: 'IMAGE' | 'VIDEO';
  storeSlug?: string;
  castSlug?: string;
}

const STORE_VIDEO_URLS = {
  nightlife:
    'https://videos.pexels.com/video-files/7271837/7271837-uhd_3840_2160_25fps.mp4',
  restaurant:
    'https://videos.pexels.com/video-files/31631562/13476222_3840_2160_25fps.mp4',
  ktv: 'https://www.pexels.com/download/video/8117118/',
  spa: 'https://www.pexels.com/download/video/6187089/',
} as const;

const restaurantStoreSlugs = new Set(['hanami-dining', 'tokyo-kitchen']);
const ktvStoreSlugs = new Set([
  'golden-voice-ktv',
  'star-ktv',
  'harbor-ktv-hai-phong',
]);
const spaStoreSlugs = new Set(['opera-spa-hai-phong']);

function storeVideoUrl(slug: string) {
  if (restaurantStoreSlugs.has(slug)) {
    return STORE_VIDEO_URLS.restaurant;
  }

  if (ktvStoreSlugs.has(slug)) {
    return STORE_VIDEO_URLS.ktv;
  }

  if (spaStoreSlugs.has(slug)) {
    return STORE_VIDEO_URLS.spa;
  }

  return STORE_VIDEO_URLS.nightlife;
}

function storeHero(slug: string, label: string): MediaSeed {
  return {
    storageKey: `seed/stores/${slug}/hero.jpg`,
    originalName: `${label} hero.jpg`,
    mimeType: 'image/jpeg',
    sizeBytes: 204800,
    url: `/media/demo/stores/${slug}.jpg`,
    purpose: 'hero',
    type: 'IMAGE',
    storeSlug: slug,
  };
}

function storeVideo(slug: string): MediaSeed {
  return {
    storageKey: `seed/stores/${slug}/promo.mp4`,
    originalName: `${slug}-promo.mp4`,
    mimeType: 'video/mp4',
    sizeBytes: 10485760,
    url: storeVideoUrl(slug),
    purpose: 'promo',
    type: 'VIDEO',
    storeSlug: slug,
  };
}

function castAvatar(slug: string, label: string): MediaSeed {
  return {
    storageKey: `seed/casts/${slug}/avatar.jpg`,
    originalName: `${label} avatar.jpg`,
    mimeType: 'image/jpeg',
    sizeBytes: 102400,
    url: `/media/demo/casts/${slug}.jpg`,
    purpose: 'avatar',
    type: 'IMAGE',
    castSlug: slug,
  };
}

// ── Store info for building media entries ──
const STORE_LABELS: Array<{ slug: string; label: string }> = [
  { slug: 'moonlight-bar', label: 'Moonlight Bar' },
  { slug: 'velvet-club', label: 'Velvet Club' },
  { slug: 'sakura-lounge', label: 'Sakura Lounge' },
  { slug: 'golden-voice-ktv', label: 'Golden Voice' },
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

// ── Cast info for building media entries ──
const CAST_LABELS: Array<{ slug: string; label: string }> = [
  { slug: 'sakura-moonlight', label: 'Sakura' },
  { slug: 'miyuki-moonlight', label: 'Miyuki' },
  { slug: 'rina-velvet', label: 'Rina' },
  { slug: 'aya-velvet', label: 'Aya' },
  { slug: 'yuki-sakura-lounge', label: 'Yuki' },
  { slug: 'hana-sakura-lounge', label: 'Hana' },
  { slug: 'mai-golden', label: 'Mai' },
  { slug: 'nana-golden', label: 'Nana' },
  { slug: 'rumi-hanami', label: 'Rumi' },
  { slug: 'kaori-hanami', label: 'Kaori' },
  { slug: 'misaki-crimson', label: 'Misaki' },
  { slug: 'rei-crimson', label: 'Rei' },
  { slug: 'yuna-neon', label: 'Yuna' },
  { slug: 'sora-neon', label: 'Sora' },
  { slug: 'akari-jade', label: 'Akari' },
  { slug: 'hikaru-jade', label: 'Hikaru' },
  { slug: 'erika-star', label: 'Erika' },
  { slug: 'tsubasa-star', label: 'Tsubasa' },
  { slug: 'kotone-tokyo', label: 'Kotone' },
  { slug: 'aoi-tokyo', label: 'Aoi' },
  { slug: 'lina-dragon-rooftop', label: 'Lina' },
  { slug: 'mai-dragon-rooftop', label: 'Mai' },
  { slug: 'nami-son-tra', label: 'Nami' },
  { slug: 'eri-son-tra', label: 'Eri' },
  { slug: 'mika-harbor-ktv', label: 'Mika' },
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
  console.log('  🖼️  Seeding media...');
  let count = 0;

  const mediaItems: MediaSeed[] = [];

  // Store hero images + store promo videos
  for (const s of STORE_LABELS) {
    mediaItems.push(storeHero(s.slug, s.label));
    mediaItems.push(storeVideo(s.slug));
  }

  // Cast avatar images
  for (const c of CAST_LABELS) {
    mediaItems.push(castAvatar(c.slug, c.label));
  }

  for (const m of mediaItems) {
    const storeId = m.storeSlug ? (stores[m.storeSlug]?.id ?? null) : null;
    const castId = m.castSlug ? (casts[m.castSlug]?.id ?? null) : null;

    await prisma.media.upsert({
      where: { storageKey: m.storageKey },
      update: {
        url: m.url,
        purpose: m.purpose,
        type: m.type,
        status: 'READY',
      },
      create: {
        storageKey: m.storageKey,
        originalName: m.originalName,
        mimeType: m.mimeType,
        sizeBytes: m.sizeBytes,
        url: m.url,
        purpose: m.purpose,
        type: m.type,
        access: 'PUBLIC',
        status: 'READY',
        storeId,
        castId,
      },
    });
    count++;
  }

  console.log(
    `     ✓ ${count} media files (${STORE_LABELS.length} store heroes, ${STORE_LABELS.length} videos, ${CAST_LABELS.length} cast avatars)`,
  );
}
