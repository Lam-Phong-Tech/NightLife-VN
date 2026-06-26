import { PrismaClient, Role } from '@prisma/client';

const ROLES = [
  {
    key: 'admin',
    name: 'Administrator',
    description: 'Full system access — manage all stores, casts, bookings, bills, rankings, and settings',
  },
  {
    key: 'partner',
    name: 'Partner',
    description: 'Store partner — login, scan QR codes, confirm customer check-in (MVP scope)',
  },
  {
    key: 'operator',
    name: 'Operator',
    description: 'Internal operations staff — manage bookings and content (P1 scope)',
  },
];

export async function seedRoles(
  prisma: PrismaClient,
): Promise<Record<string, Role>> {
  console.log('  📋 Seeding roles...');
  const result: Record<string, Role> = {};

  for (const r of ROLES) {
    result[r.key] = await prisma.role.upsert({
      where: { key: r.key },
      update: { name: r.name, description: r.description, status: 'ACTIVE' },
      create: { key: r.key, name: r.name, description: r.description, status: 'ACTIVE' },
    });
  }

  console.log(`     ✓ ${Object.keys(result).length} roles`);
  return result;
}
