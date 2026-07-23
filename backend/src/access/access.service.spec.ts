import { AccessService } from './access.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AccessService', () => {
  const prisma = {
    rolePermission: {
      findFirst: jest.fn(),
    },
    store: {
      findMany: jest.fn(),
    },
    storePermission: {
      findMany: jest.fn(),
    },
    couponIssue: {
      findFirst: jest.fn(),
    },
    bill: {
      findFirst: jest.fn(),
    },
  } as unknown as jest.Mocked<PrismaService>;

  let service: AccessService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AccessService(prisma);
  });

  it('checks action permissions from the role-permission matrix', async () => {
    prisma.rolePermission.findFirst.mockResolvedValue({ id: 'rp-1' });

    await expect(
      service.canViewPartnerBooking({
        id: 'partner-1',
        role: 'PARTNER',
      }),
    ).resolves.toBe(true);
    await expect(
      service.canViewRevenueReport({
        id: 'admin-1',
        role: 'ADMIN',
      }),
    ).resolves.toBe(true);

    expect(prisma.rolePermission.findFirst).toHaveBeenNthCalledWith(1, {
      where: {
        role: {
          key: 'partner',
          status: 'ACTIVE',
          deletedAt: null,
        },
        permission: {
          key: 'booking.partner.view',
        },
      },
      select: { id: true },
    });
    expect(prisma.rolePermission.findFirst).toHaveBeenNthCalledWith(2, {
      where: {
        role: {
          key: 'admin',
          status: 'ACTIVE',
          deletedAt: null,
        },
        permission: {
          key: 'report.revenue.view',
        },
      },
      select: { id: true },
    });
  });

  it('limits partner scope to one primary store and prefers delegated permissions', async () => {
    prisma.store.findMany.mockResolvedValue([{ id: 'owned-store' }] as never);
    prisma.storePermission.findMany.mockResolvedValue([
      { storeId: 'delegated-store' },
      { storeId: 'owned-store' },
    ] as never);

    await expect(
      service.getAccessibleStoreIds(
        { id: 'partner-1', role: 'PARTNER' },
        'coupon.scan',
      ),
    ).resolves.toEqual(['delegated-store']);

    expect(prisma.store.findMany).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        OR: [
          { ownerId: 'partner-1' },
          {
            partnerAccount: {
              userId: 'partner-1',
              deletedAt: null,
              status: { in: ['ACTIVE', 'PENDING_REVIEW'] },
            },
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });

    expect(prisma.storePermission.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'partner-1',
        deletedAt: null,
        status: 'ACTIVE',
        permissions: { has: 'coupon.scan' },
      },
      orderBy: { createdAt: 'desc' },
      select: { storeId: true },
    });
  });

  it('allows a delegated partner to scan a coupon only within store permission scope', async () => {
    prisma.rolePermission.findFirst.mockResolvedValue({ id: 'rp-1' });
    prisma.couponIssue.findFirst.mockResolvedValue({
      coupon: { storeId: 'delegated-store' },
    });
    prisma.store.findMany.mockResolvedValue([] as never);
    prisma.storePermission.findMany.mockResolvedValue([
      { storeId: 'delegated-store' },
    ] as never);

    await expect(
      service.canScanCoupon(
        { id: 'partner-1', role: 'PARTNER' },
        { code: 'GUEST-code' },
      ),
    ).resolves.toBe(true);
  });

  it('allows store staff into partner scope through delegated store permissions', async () => {
    prisma.rolePermission.findFirst.mockResolvedValue(null);
    prisma.storePermission.findMany
      .mockResolvedValueOnce([{ id: 'permission-1' }] as never)
      .mockResolvedValueOnce([{ storeId: 'assigned-store' }] as never);

    await expect(
      service.canViewPartnerStore({
        id: 'staff-1',
        role: 'STAFF',
      }),
    ).resolves.toBe(true);
    await expect(
      service.getAccessibleStoreIds(
        { id: 'staff-1', role: 'STAFF' },
        'store.partner.view',
      ),
    ).resolves.toEqual(['assigned-store']);

    expect(prisma.storePermission.findMany).toHaveBeenNthCalledWith(1, {
      where: {
        userId: 'staff-1',
        deletedAt: null,
        status: 'ACTIVE',
      },
      take: 1,
      select: { id: true },
    });
    expect(prisma.storePermission.findMany).toHaveBeenNthCalledWith(2, {
      where: {
        userId: 'staff-1',
        deletedAt: null,
        status: 'ACTIVE',
      },
      select: { storeId: true },
    });
  });

  it('allows store staff action permission through exact or wildcard store permissions', async () => {
    prisma.rolePermission.findFirst.mockResolvedValue(null);
    prisma.storePermission.findMany
      .mockResolvedValueOnce([{ id: 'permission-1' }] as never)
      .mockResolvedValueOnce([{ storeId: 'assigned-store' }] as never);

    await expect(
      service.hasRolePermission(
        { id: 'staff-1', role: 'STAFF' },
        'coupon.scan',
      ),
    ).resolves.toBe(true);

    await expect(
      service.getAccessibleStoreIds(
        { id: 'staff-1', role: 'STAFF' },
        'coupon.scan',
      ),
    ).resolves.toEqual(['assigned-store']);

    expect(prisma.storePermission.findMany).toHaveBeenNthCalledWith(1, {
      where: {
        userId: 'staff-1',
        deletedAt: null,
        status: 'ACTIVE',
        OR: [
          { permissions: { has: 'coupon.scan' } },
          { permissions: { has: 'store.staff.all' } },
        ],
      },
      take: 1,
      select: { id: true },
    });
    expect(prisma.storePermission.findMany).toHaveBeenNthCalledWith(2, {
      where: {
        userId: 'staff-1',
        deletedAt: null,
        status: 'ACTIVE',
        OR: [
          { permissions: { has: 'coupon.scan' } },
          { permissions: { has: 'store.staff.all' } },
        ],
      },
      select: { storeId: true },
    });
  });

  it('checks separated bill approval permissions with platform-wide admin scope', async () => {
    prisma.rolePermission.findFirst.mockResolvedValue({ id: 'rp-1' });

    await expect(
      service.canApproveBill({ id: 'admin-1', role: 'ADMIN' }, 'bill-1'),
    ).resolves.toBe(true);
    await expect(
      service.canApproveBill(
        { id: 'super-admin-1', role: 'SUPER_ADMIN' },
        'bill-2',
      ),
    ).resolves.toBe(true);

    expect(prisma.rolePermission.findFirst).toHaveBeenNthCalledWith(1, {
      where: {
        role: {
          key: 'admin',
          status: 'ACTIVE',
          deletedAt: null,
        },
        permission: {
          key: 'bill.approve',
        },
      },
      select: { id: true },
    });
    expect(prisma.rolePermission.findFirst).toHaveBeenNthCalledWith(2, {
      where: {
        role: {
          key: 'super_admin',
          status: 'ACTIVE',
          deletedAt: null,
        },
        permission: {
          key: 'bill.approve',
        },
      },
      select: { id: true },
    });
    expect(prisma.bill.findFirst).not.toHaveBeenCalled();
  });
});
