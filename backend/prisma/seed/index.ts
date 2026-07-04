import { PrismaClient } from '@prisma/client';
import { seedPermissions, seedRoles } from './00-roles';
import { seedUsers } from './01-users';
import { seedAreas } from './02-areas';
import { seedPartners } from './03-partners';
import { seedStores } from './04-stores';
import { seedCasts } from './05-casts';
import { seedMedia } from './06-media';
import { seedCoupons } from './07-coupons';
import { seedCommissions } from './08-commissions';
import { seedContents } from './09-contents';
import { seedRankings } from './10-rankings';
import { seedStorePermissions } from './11-store-permissions';


export async function seedAll(prisma: PrismaClient, passwordHash: string) {
  console.log('🌱 NightLife Vietnam — Seed Data v2.0\n');
  console.log('═══════════════════════════════════════');

  const roles    = await seedRoles(prisma);
  await seedPermissions(prisma, roles);
  const users    = await seedUsers(prisma, passwordHash, roles);
  const areas    = await seedAreas(prisma);
  const partners = await seedPartners(prisma, users);
  const stores   = await seedStores(prisma, users, areas, partners);
  await seedStorePermissions(prisma, users, stores);
  const casts    = await seedCasts(prisma, stores);
  await seedMedia(prisma, stores, casts);
  const coupons  = await seedCoupons(prisma, stores);
  await seedCommissions(prisma, stores, users);
  await seedContents(prisma, users);
  await seedRankings(prisma, stores, casts, users);


  console.log('═══════════════════════════════════════');
  console.log('\n✅ Seed completed successfully!\n');

  console.log('📋 Summary:');
  console.log('  • Roles:         5 (admin, partner, operator, staff, member)');
  console.log('  • Users:         8 (1 admin, 1 operator, 1 staff, 3 partners, 1 member, 1 VIP)');
  console.log('  • Areas:         10 (HCM/HN/DN/HP)');
  console.log('  • Stores:        15 (HCM/HN/DN/HP)');
  console.log('  • Casts:         31');
  console.log('  • Media:         106 assets (15 heroes + 30 gallery + 15 YouTube + 31 cast avatars)');
  console.log('    ↳ Images: Unsplash CDN (stable, no broken links)');
  console.log('    ↳ Videos: YouTube embed URLs (real bar/restaurant/club videos)');
  console.log('  • Coupons:       5 (3 PERCENT + 2 FIXED)');
  console.log('  • Commissions:   10 configs');
  console.log('  • Contents:      5 (3 blogs + 2 policies)');
  console.log('  • Rankings:      10 (5 casts + 5 stores)');
  console.log('  • Guests:        10 walk-in customers');
  console.log('  • Bookings:      20 (12 completed, 3 confirmed, 2 requested, 1 cancelled, 1 no-show, 1 checked-in)');
  console.log('  • Bills:         12 PAID (with service charge 5% + tax 10% + commission 15%)');
  console.log('  • BookingQRs:    ~10 QR codes');
  console.log('  • PointLedgers:  ~6 EARN entries for member/VIP users');
  console.log('');
  console.log('🔑 Login credentials (all: Str0ngPass!):');
  console.log('  • admin@nightlife.vn     → ADMIN / VIP');
  console.log('  • operator@nightlife.vn  → OPERATOR / MEMBER');
  console.log('  • staff@nightlife.vn     → STAFF / MEMBER');
  console.log('  • partner1@nightlife.vn  → PARTNER / MEMBER');
  console.log('  • partner2@nightlife.vn  → PARTNER / MEMBER');
  console.log('  • member@nightlife.vn    → USER / MEMBER');
  console.log('  • vip@nightlife.vn       → USER / VIP');
  console.log('');
  console.log('🖼️  Image sources:');
  console.log('  • Store/Cast photos → Unsplash CDN (https://images.unsplash.com)');
  console.log('  • Promo videos      → YouTube embed (https://www.youtube.com/embed/...)');
}
