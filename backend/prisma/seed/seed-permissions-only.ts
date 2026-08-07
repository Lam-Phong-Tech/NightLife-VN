/**
 * seed-permissions-only.ts
 *
 * Script seed an toàn cho môi trường production.
 * CHỈ cập nhật bảng: roles, permissions, role_permissions.
 * KHÔNG đụng tới: users, stores, bookings, bills, casts, v.v.
 *
 * Sử dụng: pnpm seed:permissions
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { seedPermissions, seedRoles } from './00-roles';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? '',
  }),
});

async function main() {
  console.log('🔐 NightLife — Seed Permissions Only\n');
  console.log('═══════════════════════════════════════');
  console.log('⚠️  Chỉ cập nhật: roles, permissions, role_permissions');
  console.log('✅  An toàn với dữ liệu production\n');

  const roles = await seedRoles(prisma);
  await seedPermissions(prisma, roles);

  console.log('\n═══════════════════════════════════════');
  console.log('✅ Seed permissions hoàn tất!\n');
}

main()
  .finally(() => prisma.$disconnect())
  .catch((error) => {
    console.error('❌ Lỗi khi seed permissions:', error);
    process.exit(1);
  });
