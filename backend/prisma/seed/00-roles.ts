import { Permission, PrismaClient, Role } from '@prisma/client';

const ROLES = [
  {
    key: 'super_admin',
    name: 'Super Administrator',
    description: 'Absolute full system access, including system configuration and hard deletes',
    level: 100,
  },
  {
    key: 'admin',
    name: 'Administrator',
    description:
      'System access: manage all stores, casts, bookings, bills, rankings, and settings',
    level: 80,
  },
  {
    key: 'operator',
    name: 'Operator',
    description:
      'Operational reviewer: manage bookings, scans, and bill review queues',
    level: 50,
  },
  {
    key: 'staff',
    name: 'Staff',
    description:
      'Internal support staff role, separated from Operator for P1 RBAC expansion',
    level: 40,
  },
  {
    key: 'partner',
    name: 'Partner',
    description:
      'Store partner: login, scan QR codes, confirm customer check-in',
    level: 30,
  },
  {
    key: 'member',
    name: 'Member',
    description: 'Signed-in customer account with member and VIP benefits',
    level: 10,
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
    description:
      'Legacy bill review permission kept for compatibility; Admin CMS routes use the separated approval permissions.',
    roleKeys: ['admin'],
  },
  {
    key: 'bill.approval.preview',
    name: 'Preview bill approval',
    description:
      'Preview gross, discount, net, payable, commission, and loyalty impact before approval',
    roleKeys: ['admin'],
  },
  {
    key: 'bill.approve',
    name: 'Approve or reject bill',
    description:
      'Approve or reject submitted bills through the Admin sensitive bill review route',
    roleKeys: ['admin'],
  },
  {
    key: 'bill.pm_ba.confirm',
    name: 'Confirm PM/BA bill approval',
    description:
      'Confirm PM/BA reason for negative-commission bills before final verification',
    roleKeys: ['admin'],
  },
  {
    key: 'bill.void',
    name: 'Void reviewed bill',
    description:
      'Void or refund a reviewed bill and reverse the related loyalty ledger when needed',
    roleKeys: ['admin'],
  },
  {
    key: 'bill.reverse',
    name: 'Reverse approved bill',
    description:
      'Reverse approved bills manually or through the high-risk auto reversal workflow',
    roleKeys: ['admin'],
  },
  {
    key: 'bill.sensitive.view',
    name: 'View sensitive bill queue',
    description: 'View bill review queue with field-level masking by role',
    roleKeys: ['admin', 'operator'],
  },
  {
    key: 'report.revenue.view',
    name: 'View revenue report',
    description: 'View revenue, discount, and commission reports',
    roleKeys: ['admin'],
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
    roleKeys: ['super_admin', 'admin', 'operator', 'staff'],
  },
  {
    key: 'system.storage.config',
    name: 'Configure VPS Storage',
    description: 'Configure maximum allowed VPS storage',
    roleKeys: ['super_admin'],
  },
  {
    key: 'system.storage.view',
    name: 'View VPS Storage',
    description: 'View current VPS storage usage',
    roleKeys: ['super_admin', 'admin'],
  },
  {
    key: 'system.hard_delete',
    name: 'Hard Delete Records',
    description: 'Permanently remove records from database',
    roleKeys: ['super_admin'],
  },
  {
    key: 'system.role.assign',
    name: 'Assign Roles',
    description: 'Assign roles to other users (restricted by role level)',
    roleKeys: ['super_admin', 'admin'],
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
      update: { name: r.name, description: r.description, level: r.level, status: 'ACTIVE' },
      create: {
        key: r.key,
        name: r.name,
        description: r.description,
        level: r.level,
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
