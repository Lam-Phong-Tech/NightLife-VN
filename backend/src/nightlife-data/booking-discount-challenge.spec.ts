import {
  BadRequestException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import QRCode from 'qrcode';
import { AccessService } from '../access/access.service';
import { PrismaService } from '../prisma/prisma.service';
import { NightlifeDataService } from './nightlife-data.service';

describe('Booking and Discount Flows Backend Integration (Challenge)', () => {
  const prisma = {
    $transaction: jest.fn(),
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    guest: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    coupon: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    couponIssue: {
      create: jest.fn(),
      findFirst: jest.fn(),
      updateMany: jest.fn(),
    },
    store: {
      findFirst: jest.fn(),
      count: jest.fn(),
    },
    booking: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    adminCoupon: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    adminCouponIssue: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    notificationLog: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  } as unknown as jest.Mocked<PrismaService>;

  const accessService = {
    ensureStoreAccess: jest.fn(),
    getAccessibleStoreIds: jest.fn(),
  } as unknown as jest.Mocked<AccessService>;

  const adminNotificationService = {
    notifyBookingCreated: jest.fn(),
    notifyBookingCancelled: jest.fn(),
    notifyBillSubmitted: jest.fn(),
    notifyBillReviewed: jest.fn(),
    notifyPartnerRequest: jest.fn(),
  };

  const emailNotificationService = {
    sendBookingQrEmail: jest.fn(),
  };

  const passwordService = {
    hash: jest.fn(),
  };

  let service: NightlifeDataService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation((callback) => callback(prisma));
    jest.spyOn(QRCode, 'toDataURL').mockResolvedValue('data:image/png;base64,test-booking-qr');
    jest.useFakeTimers().setSystemTime(new Date('2026-06-20T10:00:00.000Z'));

    prisma.guest.create.mockResolvedValue({ id: 'guest-1' });
    prisma.booking.create.mockResolvedValue({
      id: 'booking-1',
      bookingCode: 'BK-12345',
      status: 'REQUESTED',
      scheduledAt: new Date('2026-06-30T14:00:00.000Z'),
    });
    prisma.notificationLog.create.mockResolvedValue({ id: 'log-1' });
    prisma.notificationLog.findMany.mockResolvedValue([]);
    prisma.auditLog.findMany.mockResolvedValue([]);
    prisma.couponIssue.create.mockResolvedValue({
      id: 'issue-new-id',
      code: 'GUEST-new-code',
      couponId: 'coupon-new-id',
      status: 'ISSUED',
      metadata: {},
      coupon: { storeId: 'store-1' },
    });

    service = new NightlifeDataService(
      prisma,
      accessService,
      adminNotificationService as never,
      undefined,
      emailNotificationService as never,
      passwordService as never,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('1. Bypassing store checks for GUEST5, MEMBER8, VIP10 across different stores', () => {
    it.each([
      ['GUEST5', 'coupon-guest5'],
      ['MEMBER8', 'coupon-member8'],
      ['VIP10', 'coupon-vip10'],
    ])(
      'allows booking store store-1 to use default coupon %s owned by store-2',
      async (code, couponId) => {
        prisma.store.findFirst.mockResolvedValue({
          id: 'store-1',
          name: 'Target Store',
          slug: 'target-store',
          openingHours: null,
        });

        // Mock default coupons list check
        prisma.coupon.findMany.mockResolvedValue([
          { id: couponId, code },
        ] as any);

        // Mock finding the coupon (storeId doesn't match target booking store)
        prisma.coupon.findFirst.mockResolvedValue({
          id: couponId,
          code,
          name: 'Default Coupon',
          storeId: 'store-2',
          discountType: 'PERCENT',
          discountValue: 10,
          usageLimit: null,
          usedCount: 0,
          endsAt: null,
          store: { id: 'store-2', name: 'Other Store', slug: 'other-store' },
        } as any);

        await expect(
          service.createGuestBooking({
            storeSlug: 'target-store',
            displayName: 'Guest User',
            email: 'guest@example.com',
            scheduledAt: '2026-06-30T14:00:00.000Z',
            partySize: 2,
            couponId,
          }),
        ).resolves.toBeDefined();

        // Verify finding the coupon was called without restricting to target store-1
        expect(prisma.coupon.findFirst).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              id: couponId,
            }),
          }),
        );
        expect(prisma.coupon.findFirst.mock.calls[0][0].where).not.toHaveProperty('storeId');
      },
    );

    it('rejects booking store store-1 using non-default coupon owned by store-2', async () => {
      prisma.store.findFirst.mockResolvedValue({
        id: 'store-1',
        name: 'Target Store',
        slug: 'target-store',
        openingHours: null,
      });

      // Mock default coupons check returning empty (meaning coupon-custom is NOT a default coupon)
      prisma.coupon.findMany.mockResolvedValue([]);

      // Mock coupon.findFirst returning null because storeId filter in where clause prevents match
      prisma.coupon.findFirst.mockResolvedValue(null);

      await expect(
        service.createGuestBooking({
          storeSlug: 'target-store',
          displayName: 'Guest User',
          email: 'guest@example.com',
          scheduledAt: '2026-06-30T14:00:00.000Z',
          partySize: 2,
          couponId: 'coupon-custom',
        }),
      ).rejects.toThrow(NotFoundException);

      // Verify finding the coupon specified storeId constraint
      expect(prisma.coupon.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 'coupon-custom',
            storeId: 'store-1',
          }),
        }),
      );
    });
  });

  describe('2. VIP, Member, and Guest tier validations for Admin Coupons', () => {
    const adminCouponBase = {
      id: 'admin-coupon-1',
      code: 'ADMIN10',
      status: 'ACTIVE',
      startsAt: new Date('2026-06-01T00:00:00.000Z'),
      endsAt: null,
      usageLimit: null,
      usedCount: 0,
      discountType: 'PERCENT',
      discountValue: 10,
      targetStores: [],
    };

    it('allows a VIP user to claim and book using an Admin Coupon targeted to VIP', async () => {
      prisma.store.findFirst.mockResolvedValue({
        id: 'store-1',
        name: 'Store 1',
        slug: 'store-1',
        openingHours: null,
      });

      prisma.adminCouponIssue.findFirst.mockResolvedValue({
        id: 'admin-issue-1',
        adminCouponId: 'admin-coupon-1',
        status: 'ISSUED',
        expiresAt: null,
        userId: 'member-vip-1',
        adminCoupon: {
          ...adminCouponBase,
          targetAudiences: ['VIP'],
        },
      } as any);

      await expect(
        service.createMemberBooking(
          { id: 'member-vip-1', role: 'USER', tier: 'VIP' },
          {
            storeSlug: 'store-1',
            displayName: 'VIP Member',
            email: 'member@example.com',
            scheduledAt: '2026-06-30T14:00:00.000Z',
            partySize: 2,
            adminCouponIssueId: 'admin-issue-1',
          },
        ),
      ).resolves.toBeDefined();
    });

    it('rejects a MEMBER user from booking using an Admin Coupon targeted to VIP', async () => {
      prisma.store.findFirst.mockResolvedValue({
        id: 'store-1',
        name: 'Store 1',
        slug: 'store-1',
        openingHours: null,
      });

      prisma.adminCouponIssue.findFirst.mockResolvedValue({
        id: 'admin-issue-1',
        adminCouponId: 'admin-coupon-1',
        status: 'ISSUED',
        expiresAt: null,
        userId: 'member-regular-1',
        adminCoupon: {
          ...adminCouponBase,
          targetAudiences: ['VIP'],
        },
      } as any);

      await expect(
        service.createMemberBooking(
          { id: 'member-regular-1', role: 'USER', tier: 'MEMBER' },
          {
            storeSlug: 'store-1',
            displayName: 'Regular Member',
            email: 'member@example.com',
            scheduledAt: '2026-06-30T14:00:00.000Z',
            partySize: 2,
            adminCouponIssueId: 'admin-issue-1',
          },
        ),
      ).rejects.toThrow(new UnprocessableEntityException('User tier is not eligible for this admin coupon'));
    });

    it('allows a guest to claim an Admin Coupon targeted to GUEST', async () => {
      prisma.adminCoupon.findFirst.mockResolvedValue({
        ...adminCouponBase,
        targetAudiences: ['GUEST'],
      } as any);

      prisma.adminCouponIssue.findFirst.mockResolvedValue(null); // No duplicate claims
      prisma.adminCouponIssue.create.mockResolvedValue({
        id: 'admin-issue-guest-1',
        status: 'ISSUED',
      } as any);

      await expect(
        service.claimAdminGlobalCouponForGuest('admin-coupon-1', {
          phone: '+84999999999',
          displayName: 'Guest User',
        }),
      ).resolves.toBeDefined();
    });

    it('rejects guest claim if Admin Coupon targetAudiences does not include GUEST', async () => {
      prisma.adminCoupon.findFirst.mockResolvedValue({
        ...adminCouponBase,
        targetAudiences: ['VIP', 'MEMBER'],
      } as any);

      await expect(
        service.claimAdminGlobalCouponForGuest('admin-coupon-1', {
          phone: '+84999999999',
          displayName: 'Guest User',
        }),
      ).rejects.toThrow(new UnprocessableEntityException('Guest not eligible for this coupon'));
    });

    it('validates audience check case-insensitively', async () => {
      prisma.store.findFirst.mockResolvedValue({
        id: 'store-1',
        name: 'Store 1',
        slug: 'store-1',
        openingHours: null,
      });

      prisma.adminCouponIssue.findFirst.mockResolvedValue({
        id: 'admin-issue-1',
        adminCouponId: 'admin-coupon-1',
        status: 'ISSUED',
        expiresAt: null,
        userId: 'member-vip-1',
        adminCoupon: {
          ...adminCouponBase,
          targetAudiences: ['vip'], // lowercase in database targetAudiences
        },
      } as any);

      await expect(
        service.createMemberBooking(
          { id: 'member-vip-1', role: 'USER', tier: 'VIP' }, // uppercase in user model
          {
            storeSlug: 'store-1',
            displayName: 'VIP Member',
            email: 'member@example.com',
            scheduledAt: '2026-06-30T14:00:00.000Z',
            partySize: 2,
            adminCouponIssueId: 'admin-issue-1',
          },
        ),
      ).resolves.toBeDefined();
    });
  });

  describe('3. Store scope targetStores constraints for Admin Coupons', () => {
    const adminCouponBase = {
      id: 'admin-coupon-1',
      code: 'ADMIN10',
      status: 'ACTIVE',
      startsAt: new Date('2026-06-01T00:00:00.000Z'),
      endsAt: null,
      usageLimit: null,
      usedCount: 0,
      discountType: 'PERCENT',
      discountValue: 10,
      targetAudiences: [],
    };

    it('allows booking when store ID is in eligible targetStores list', async () => {
      prisma.store.findFirst.mockResolvedValue({
        id: 'store-eligible',
        name: 'Eligible Store',
        slug: 'store-eligible',
        openingHours: null,
      });

      prisma.adminCouponIssue.findFirst.mockResolvedValue({
        id: 'admin-issue-1',
        adminCouponId: 'admin-coupon-1',
        status: 'ISSUED',
        expiresAt: null,
        userId: 'member-1',
        adminCoupon: {
          ...adminCouponBase,
          targetStores: ['store-eligible', 'store-another'],
        },
      } as any);

      await expect(
        service.createMemberBooking(
          { id: 'member-1', role: 'USER', tier: 'FREE' },
          {
            storeSlug: 'store-eligible',
            displayName: 'Free Member',
            email: 'member@example.com',
            scheduledAt: '2026-06-30T14:00:00.000Z',
            partySize: 2,
            adminCouponIssueId: 'admin-issue-1',
          },
        ),
      ).resolves.toBeDefined();
    });

    it('rejects booking when store ID is not in targetStores list', async () => {
      prisma.store.findFirst.mockResolvedValue({
        id: 'store-not-eligible',
        name: 'Ineligible Store',
        slug: 'store-not-eligible',
        openingHours: null,
      });

      prisma.adminCouponIssue.findFirst.mockResolvedValue({
        id: 'admin-issue-1',
        adminCouponId: 'admin-coupon-1',
        status: 'ISSUED',
        expiresAt: null,
        userId: 'member-1',
        adminCoupon: {
          ...adminCouponBase,
          targetStores: ['store-eligible'],
        },
      } as any);

      await expect(
        service.createMemberBooking(
          { id: 'member-1', role: 'USER', tier: 'FREE' },
          {
            storeSlug: 'store-not-eligible',
            displayName: 'Free Member',
            email: 'member@example.com',
            scheduledAt: '2026-06-30T14:00:00.000Z',
            partySize: 2,
            adminCouponIssueId: 'admin-issue-1',
          },
        ),
      ).rejects.toThrow(new UnprocessableEntityException('Store is not eligible for this admin coupon'));
    });
  });

  describe('4. Used count limits and duplicate claim prevention', () => {
    it('prevents claiming member admin coupon if usageLimit has been reached', async () => {
      prisma.adminCoupon.findFirst.mockResolvedValue({
        id: 'admin-coupon-1',
        code: 'ADMIN10',
        status: 'ACTIVE',
        startsAt: new Date('2026-06-01T00:00:00.000Z'),
        endsAt: null,
        usageLimit: 10,
        usedCount: 10, // reached
        discountType: 'PERCENT',
        discountValue: 10,
      } as any);

      await expect(
        service.claimAdminGlobalCouponForMember('admin-coupon-1', { id: 'member-1', role: 'USER' }),
      ).rejects.toThrow(new UnprocessableEntityException('Admin coupon usage limit reached'));
    });

    it('prevents claiming guest admin coupon if usageLimit has been reached', async () => {
      prisma.adminCoupon.findFirst.mockResolvedValue({
        id: 'admin-coupon-1',
        code: 'ADMIN10',
        status: 'ACTIVE',
        startsAt: new Date('2026-06-01T00:00:00.000Z'),
        endsAt: null,
        usageLimit: 10,
        usedCount: 10, // reached
        discountType: 'PERCENT',
        discountValue: 10,
      } as any);

      await expect(
        service.claimAdminGlobalCouponForGuest('admin-coupon-1', { phone: '+84999999999', displayName: 'Guest' }),
      ).rejects.toThrow(new UnprocessableEntityException('Admin coupon usage limit reached'));
    });

    it('prevents member from duplicate claims of the same Admin Coupon', async () => {
      prisma.adminCoupon.findFirst.mockResolvedValue({
        id: 'admin-coupon-1',
        code: 'ADMIN10',
        status: 'ACTIVE',
        startsAt: new Date('2026-06-01T00:00:00.000Z'),
        endsAt: null,
        usageLimit: 10,
        usedCount: 2,
        discountType: 'PERCENT',
        discountValue: 10,
      } as any);

      // Mock existing issue found
      prisma.adminCouponIssue.findFirst.mockResolvedValue({
        id: 'existing-admin-issue',
        adminCouponId: 'admin-coupon-1',
        userId: 'member-1',
        status: 'ISSUED',
      } as any);

      await expect(
        service.claimAdminGlobalCouponForMember('admin-coupon-1', { id: 'member-1', role: 'USER' }),
      ).rejects.toThrow(new UnprocessableEntityException('You have already claimed this coupon'));
    });

    it('prevents guest from duplicate claims of the same Admin Coupon using the same phone number', async () => {
      prisma.adminCoupon.findFirst.mockResolvedValue({
        id: 'admin-coupon-1',
        code: 'ADMIN10',
        status: 'ACTIVE',
        startsAt: new Date('2026-06-01T00:00:00.000Z'),
        endsAt: null,
        usageLimit: 10,
        usedCount: 2,
        discountType: 'PERCENT',
        discountValue: 10,
      } as any);

      // Mock guest account lookup
      prisma.guest.findFirst.mockResolvedValue({ id: 'guest-existing-id' });

      // Mock existing issue found
      prisma.adminCouponIssue.findFirst.mockResolvedValue({
        id: 'existing-admin-issue',
        adminCouponId: 'admin-coupon-1',
        guestId: 'guest-existing-id',
        status: 'ISSUED',
      } as any);

      await expect(
        service.claimAdminGlobalCouponForGuest('admin-coupon-1', { phone: '+84999999999', displayName: 'Guest' }),
      ).rejects.toThrow(new UnprocessableEntityException('This phone has already claimed this coupon'));
    });
  });
});
