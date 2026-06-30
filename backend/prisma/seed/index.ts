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
  console.log('🌱 NightLife Vietnam — Seed Data v1.0\n');
  console.log('═══════════════════════════════════════');

  const roles = await seedRoles(prisma);
  await seedPermissions(prisma, roles);
  const users = await seedUsers(prisma, passwordHash, roles);
  const areas = await seedAreas(prisma);
  const partners = await seedPartners(prisma, users);
  const stores = await seedStores(prisma, users, areas, partners);
  await seedStorePermissions(prisma, users, stores);
  const casts = await seedCasts(prisma, stores);
  await seedMedia(prisma, stores, casts);
  await seedCoupons(prisma, stores);
  await seedCommissions(prisma, stores, users);
  await seedContents(prisma, users);
  await seedRankings(prisma, stores, casts, users);

  console.log('═══════════════════════════════════════');
  console.log('\n✅ Seed completed successfully!\n');

  console.log('📋 Summary:');
  console.log('  • Roles: 5 (admin, partner, operator, staff, member)');
  console.log(
    '  • Users: 8 (1 admin, 1 operator, 1 staff, 3 partners, 1 member, 1 VIP)',
  );
  console.log('  • Areas: 10 (HCM/HN/DN/HP)');
  console.log('  • Stores: 15 (HCM/HN/DN/HP)');
  console.log('  • Casts: 29');
  console.log('  • Media: 59 image/video assets');
  console.log('  • Coupons: 5 (3 PERCENT + 2 FIXED)');
  console.log('  • Commission Configs: 10');
  console.log('  • Contents: 5 (3 blogs + 2 policies)');
  console.log('  • Rankings: 10 (5 casts + 5 stores)');
  console.log('');
  console.log('🔑 Login credentials:');
  console.log('  All accounts use password: Str0ngPass!');
  console.log('  • admin@nightlife.vn    (ADMIN / VIP)');
  console.log('  • operator@nightlife.vn (OPERATOR / PREMIUM)');
  console.log('  • staff@nightlife.vn    (STAFF / FREE)');
  console.log('  • partner1@nightlife.vn (PARTNER / PREMIUM)');
  console.log('  • partner2@nightlife.vn (PARTNER / PREMIUM)');
  console.log('  • member@nightlife.vn   (USER / FREE)');
  console.log('  • vip@nightlife.vn      (USER / VIP)');
}
