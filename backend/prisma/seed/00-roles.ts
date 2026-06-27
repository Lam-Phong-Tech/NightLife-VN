import { Permission, PrismaClient, Role } from '@prisma/client';

const ROLES = [
  {
    key: 'admin',
    name: 'Administrator',
    description:
      'Full system access: manage all stores, casts, bookings, bills, rankings, and settings',
  },
  {
    key: 'partner',
    name: 'Partner',
    description:
      'Store partner: login, scan QR codes, confirm customer check-in',
  },
  {
    key: 'operator',
    name: 'Operator',
    description:
      'Operational reviewer: manage bookings, scans, and bill review queues',
  },
  {
    key: 'staff',
    name: 'Staff',
    description:
      'Internal support staff role, separated from Operator for P1 RBAC expansion',
  },
  {
    key: 'member',
    name: 'Member',
    description: 'Signed-in customer account with member and VIP benefits',
  },
];

const PERMISSIONS = [
  {
    key: 'store.partner.view',
    name: 'View partner stores',
    description: 'View stores within the actor store scope',
    roleKeys: ['admin', 'partner', 'operator'],
  },
  {
    key: 'coupon.partner.view',
    name: 'View partner coupons',
    description: 'View coupons within the actor store scope',
    roleKeys: ['admin', 'partner', 'operator'],
  },
  {
    key: 'booking.partner.view',
    name: 'View partner bookings',
    description: 'View bookings within the actor store scope',
    roleKeys: ['admin', 'partner', 'operator'],
  },
  {
    key: 'bill.partner.view',
    name: 'View partner bills',
    description: 'View bills within the actor store scope',
    roleKeys: ['admin', 'partner', 'operator'],
  },
  {
    key: 'coupon.scan',
    name: 'Scan coupon QR',
    description: 'Scan issued coupon QR codes within the actor store scope',
    roleKeys: ['admin', 'partner', 'operator'],
  },
  {
    key: 'checkin.confirm',
    name: 'Confirm check-in',
    description: 'Confirm customer check-in after QR scan',
    roleKeys: ['admin', 'partner', 'operator'],
  },
  {
    key: 'bill.review',
    name: 'Review bill',
    description: 'Approve or reject submitted bills',
    roleKeys: ['admin', 'operator'],
  },
  {
    key: 'bill.sensitive.view',
    name: 'View sensitive bill queue',
    description: 'View bill review queue with field-level masking by role',
    roleKeys: ['admin', 'operator'],
  },
  {
    key: 'booking.member.view',
    name: 'View own member bookings',
    description: 'View bookings owned by the authenticated member',
    roleKeys: ['admin', 'member'],
  },
  {
    key: 'coupon.member.view',
    name: 'View own member coupon issues',
    description: 'View coupon issues owned by the authenticated member',
    roleKeys: ['admin', 'member'],
  },
  {
    key: 'coupon.member.claim',
    name: 'Claim member coupon',
    description: 'Claim a member or VIP coupon issue',
    roleKeys: ['member'],
  },
  {
    key: 'media.protected.read',
    name: 'Read protected media',
    description:
      'Read protected media when scoped by owner, store, or support role',
    roleKeys: ['admin', 'operator', 'staff'],
  },
];

export async function seedRoles(
  prisma: PrismaClient,
): Promise<Record<string, Role>> {
  console.log('  Seeding roles...');
  const result: Record<string, Role> = {};

  for (const r of ROLES) {
    result[r.key] = await prisma.role.upsert({
      where: { key: r.key },
      update: { name: r.name, description: r.description, status: 'ACTIVE' },
      create: {
        key: r.key,
        name: r.name,
        description: r.description,
        status: 'ACTIVE',
      },
    });
  }

  console.log(`     ${Object.keys(result).length} roles`);
  return result;
}

export async function seedPermissions(
  prisma: PrismaClient,
  roles: Record<string, Role>,
): Promise<Record<string, Permission>> {
  console.log('  Seeding permissions...');
  const result: Record<string, Permission> = {};

  for (const p of PERMISSIONS) {
    const permission = await prisma.permission.upsert({
      where: { key: p.key },
      update: { name: p.name, description: p.description },
      create: { key: p.key, name: p.name, description: p.description },
    });

    result[p.key] = permission;

    for (const roleKey of p.roleKeys) {
      const role = roles[roleKey];
      if (!role) {
        continue;
      }

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }

  console.log(`     ${Object.keys(result).length} permissions`);
  return result;
}
