import { PrismaClient, Store, Cast } from '@prisma/client';

/**
 * Demo media: store hero images, store promo videos, and cast avatars.
 * Uses stock-style image/video URLs for demo media.
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

const STORE_IMAGE_URLS: Record<string, string> = {
  'moonlight-bar':
    'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1100&q=80',
  'velvet-club':
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1100&q=80',
  'sakura-lounge':
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1100&q=80',
  'golden-voice-ktv':
    'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=1100&q=80',
  'hanami-dining':
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1100&q=80',
  'lotus-massage-spa':
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1100&q=80',
  'crimson-bar':
    'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1100&q=80',
  'neon-club':
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1100&q=80',
  'jade-lounge':
    'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=1100&q=80',
  'star-ktv':
    'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1100&q=80',
  'tokyo-kitchen':
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1100&q=80',
  'dragon-rooftop-da-nang':
    'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=1100&q=80',
  'son-tra-lounge':
    'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1100&q=80',
  'harbor-ktv-hai-phong':
    'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1100&q=80',
  'opera-spa-hai-phong':
    'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=1100&q=80',
};

const CAST_IMAGE_URLS: Record<string, string> = {
  'sakura-moonlight':
    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=800&q=80',
  'miyuki-moonlight':
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
  'rina-velvet':
    'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=800&q=80',
  'aya-velvet':
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
  'yuki-sakura-lounge':
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
  'hana-sakura-lounge':
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
  'mai-golden':
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80',
  'nana-golden':
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=800&q=80',
  'mika-golden-ktv':
    'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=800&q=80',
  'rumi-hanami':
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
  'kaori-hanami':
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  'misaki-crimson':
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
  'rei-crimson':
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
  'linh-crimson-bar':
    'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=800&q=80',
  'yuna-neon':
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
  'sora-neon':
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80',
  'akari-jade':
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  'hikaru-jade':
    'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=800&q=80',
  'erika-star':
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
  'tsubasa-star':
    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=800&q=80',
  'kotone-tokyo':
    'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=800&q=80',
  'aoi-tokyo':
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=800&q=80',
  'lina-dragon-rooftop':
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80',
  'mai-dragon-rooftop':
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
  'nami-son-tra':
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
  'eri-son-tra':
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
  'mika-harbor-ktv':
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=800&q=80',
  'hana-harbor-ktv':
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  'sumi-opera-spa':
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
  'yuri-opera-spa':
    'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=800&q=80',
  'sumi-lotus-massage-spa':
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
};

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
    url: STORE_IMAGE_URLS[slug] ?? STORE_IMAGE_URLS['neon-club'],
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
    url: CAST_IMAGE_URLS[slug] ?? CAST_IMAGE_URLS['yuna-neon'],
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
