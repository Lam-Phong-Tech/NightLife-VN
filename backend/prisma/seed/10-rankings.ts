import { PrismaClient, Store, Cast, User } from '@prisma/client';

/**
 * 10 RankingConfig: 5 CAST + 5 STORE.
 *
 * Per spec RAN-07: Ranking 100% thủ công, Admin cấu hình.
 * Per spec RAN-08: Ưu tiên Cast trước, rồi đến Quán.
 * Per spec RAN-05/ADM-07: Admin điều hướng ranking thủ công.
 *
 * manualScore: higher = better (100 for rank 1, decreasing by 10).
 * pinRank: 1 = top position.
 */

const CAST_RANKINGS = [
  { slug: 'sakura-moonlight', pinRank: 1, reason: 'Top cast — Moonlight Bar, HCM Q1. Most popular bilingual hostess.' },
  { slug: 'rina-velvet',      pinRank: 2, reason: 'Popular performer — Velvet Club, HCM Q1. High energy club star.' },
  { slug: 'yuna-neon',        pinRank: 3, reason: 'Party queen — Neon Club, HN Tây Hồ. Best party entertainer.' },
  { slug: 'akari-jade',       pinRank: 4, reason: 'Sophisticated — Jade Lounge, HN Hoàn Kiếm. Certified sommelier.' },
  { slug: 'mai-golden',       pinRank: 5, reason: 'Talented singer — Golden Voice KTV, HCM Q7. J-POP specialist.' },
  { slug: 'hana-tokyo',       pinRank: 6, reason: 'Sweet and charming — Tokyo Kitchen, HN. Excellent service.' },
  { slug: 'linh-moonlight',   pinRank: 7, reason: 'Rising star — Moonlight Bar, HCM Q1. Beautiful voice.' },
  { slug: 'chloe-velvet',     pinRank: 8, reason: 'Best dancer — Velvet Club, HCM Q1. Crowd favorite.' },
  { slug: 'minh-crimson',     pinRank: 9, reason: 'Amazing mixologist — Crimson Bar, HN. Creative drinks.' },
  { slug: 'bao-hanami',       pinRank: 10, reason: 'Attentive service — Hanami Dining, HCM. Great hospitality.' },
];

const STORE_RANKINGS = [
  // global rankings
  { slug: 'moonlight-bar',  pinRank: 1, reason: 'Top bar in HCM District 1. Premium craft cocktails & jazz.', scope: 'global' },
  { slug: 'velvet-club',    pinRank: 2, reason: 'Largest club in Saigon. World-class DJs every weekend.', scope: 'global' },
  { slug: 'crimson-bar',    pinRank: 3, reason: 'Best bar in Hanoi Old Quarter. Craft beers & live jazz.', scope: 'global' },
  { slug: 'sakura-lounge',  pinRank: 4, reason: 'Premium Japanese-style lounge HCM. Private VIP rooms.', scope: 'global' },
  { slug: 'neon-club',      pinRank: 5, reason: 'Top club in Hanoi by West Lake. Cutting-edge EDM.', scope: 'global' },
  { slug: 'golden-voice-ktv', pinRank: 6, reason: 'Best KTV in District 7. Great sound system.', scope: 'global' },
  { slug: 'jade-lounge',    pinRank: 7, reason: 'Luxury lounge in Hanoi. Elegant atmosphere.', scope: 'global' },
  { slug: 'ruby-karaoke',   pinRank: 8, reason: 'Top karaoke spot in Da Nang. Perfect for parties.', scope: 'global' },
  { slug: 'sky-bar-36',     pinRank: 9, reason: 'Highest bar in Da Nang. Stunning city views.', scope: 'global' },
  { slug: 'lotus-massage-spa', pinRank: 10, reason: 'Best massage spa in HCM District 3. Very relaxing.', scope: 'global' },
  
  // featured_home rankings
  { slug: 'hanami-dining',      pinRank: 1, reason: 'Best JP Dining HCM', scope: 'featured_home' },
  { slug: 'tokyo-kitchen',      pinRank: 2, reason: 'Best JP Dining HN', scope: 'featured_home' },
  { slug: 'lotus-massage-spa',  pinRank: 1, reason: 'Best Spa HCM', scope: 'featured_home' },
  { slug: 'opera-spa-hai-phong',pinRank: 2, reason: 'Best Spa Hai Phong', scope: 'featured_home' },
];

function getCityCode(city: string | null | undefined): string {
  if (!city) return 'all';
  if (city.includes('Hồ Chí Minh')) return '79';
  if (city.includes('Hà Nội')) return '01';
  if (city.includes('Đà Nẵng')) return '43';
  if (city.includes('Hải Phòng')) return '31';
  return 'all';
}

export async function seedRankings(
  prisma: PrismaClient,
  stores: Record<string, Store>,
  casts: Record<string, Cast>,
  users: Record<string, User>,
): Promise<void> {
  console.log('  🏆 Seeding ranking configs...');
  const adminId = users['admin']?.id ?? null;
  const storeById = new Map(Object.values(stores).map((store) => [store.id, store]));
  let count = 0;

  // ── Cast rankings (priority per RAN-08: Cast trước, Quán sau) ──
  for (const r of CAST_RANKINGS) {
    const cast = casts[r.slug];
    if (!cast) {
      console.warn(`     ⚠ Cast not found for ranking: ${r.slug}`);
      continue;
    }

    const existing = await prisma.rankingConfig.findFirst({
      where: { targetType: 'CAST', targetId: cast.id, status: 'ACTIVE' },
    });

    const store = storeById.get(cast.storeId);
    const data = {
      cityCode: getCityCode(store?.city),
      category: store?.category || null,
      scope: 'global',
      manualScore: 100 - (r.pinRank - 1) * 10,
      pinRank: r.pinRank,
      sponsored: r.pinRank === 1,
      reason: r.reason,
      status: 'ACTIVE' as const,
    };

    if (existing) {
      await prisma.rankingConfig.update({ where: { id: existing.id }, data });
    } else {
      await prisma.rankingConfig.create({
        data: {
          createdById: adminId,
          targetType: 'CAST',
          targetId: cast.id,
          ...data,
        },
      });
    }
    count++;
  }

  // ── Store rankings ──
  for (const r of STORE_RANKINGS) {
    const store = stores[r.slug];
    if (!store) {
      console.warn(`     ⚠ Store not found for ranking: ${r.slug}`);
      continue;
    }

    const existing = await prisma.rankingConfig.findFirst({
      where: { targetType: 'STORE', targetId: store.id, status: 'ACTIVE' },
    });

    const data = {
      cityCode: getCityCode(store.city),
      category: store.category,
      scope: r.scope,
      manualScore: 100 - (r.pinRank - 1) * 10,
      pinRank: r.pinRank,
      sponsored: r.pinRank === 1,
      reason: r.reason,
      status: 'ACTIVE' as const,
    };

    if (existing) {
      await prisma.rankingConfig.update({ where: { id: existing.id }, data });
    } else {
      await prisma.rankingConfig.create({
        data: {
          createdById: adminId,
          targetType: 'STORE',
          targetId: store.id,
          ...data,
        },
      });
    }
    count++;
  }

  console.log(`     ✓ ${count} ranking configs (${CAST_RANKINGS.length} casts [priority] + ${STORE_RANKINGS.length} stores)`);
}
