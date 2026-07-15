import {
  BadRequestException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import QRCode from 'qrcode';
import { AccessService } from '../access/access.service';
import { PrismaService } from '../prisma/prisma.service';
import { NightlifeDataService } from './nightlife-data.service';
import { AuthenticatedUser } from '../auth/auth.service';

describe('Booking and Discount Flows Backend Integration Challenger Suite', () => {
  const prisma = {
    $transaction: jest.fn(),
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    partnerAccount: {
      findFirst: jest.fn(),
    },
    guest: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    coupon: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    couponIssue: {
      create: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      updateMany: jest.fn(),
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
    store: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    booking: {
      create: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    notificationLog: {
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  } as unknown as jest.Mocked<PrismaService>;

  const accessService = {
    ensureStoreAccess: jest.fn(),
  } as unknown as jest.Mocked<AccessService>;

  const adminNotificationService = {
    notifyBookingCreated: jest.fn(),
    notifyBookingCancelled: jest.fn(),
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
    prisma.auditLog.findMany.mockResolvedValue([]);
    prisma.notificationLog.findMany.mockResolvedValue([]);

    // Mock QRCode generation
    jest
      .spyOn(QRCode, 'toDataURL')
      .mockResolvedValue('data:image/png;base64,test-booking-qr');

    // Initialize the service instance
    service = new NightlifeDataService(
      prisma,
      accessService,
      adminNotificationService as never,
      undefined,
      emailNotificationService as never,
      passwordService as never,
    );
  });

  describe('1. Bypassing store checks for GUEST5, MEMBER8, VIP10 across different stores', () => {
    it('allows booking with a default coupon (e.g. VIP10) belonging to a different store (bypasses store validation)', async () => {
      // Mock store lookup for the target booking store (store-target)
      prisma.store.findFirst.mockResolvedValue({
        id: 'store-target',
        name: 'Target Club',
        slug: 'target-club',
      });

      // Mock finding the default coupons ('GUEST5', 'MEMBER8', 'VIP10')
      prisma.coupon.findMany.mockResolvedValue([
        { id: 'coupon-vip10', code: 'VIP10' },
        { id: 'coupon-member8', code: 'MEMBER8' },
        { id: 'coupon-guest5', code: 'GUEST5' },
      ] as any);

      // Mock coupon validation: coupon-vip10 is configured for store-other
      prisma.coupon.findFirst.mockResolvedValue({
        id: 'coupon-vip10',
        code: 'VIP10',
        storeId: 'store-other', // Mismatch!
        status: 'ACTIVE',
        endsAt: null,
      } as any);

      prisma.guest.create.mockResolvedValue({ id: 'guest-1' });

      // Mock issuing a Booking QR coupon issue for the VIP10 coupon
      prisma.couponIssue.create.mockResolvedValue({
        id: 'issue-vip-123',
        code: 'MEMBER-vip-123',
        couponId: 'coupon-vip10',
        status: 'ISSUED',
        coupon: { storeId: 'store-other' },
      });

      prisma.booking.count.mockResolvedValue(0);
      prisma.booking.findFirst.mockResolvedValue(null);
      prisma.booking.create.mockResolvedValue({
        id: 'booking-1',
        status: 'REQUESTED',
      });

      // Attempt to book at target-club using VIP10 couponId
      await service.createMemberBooking(
        { id: 'member-1', role: 'USER', tier: 'VIP' },
        {
          storeSlug: 'target-club',
          couponId: 'coupon-vip10',
          displayName: 'VIP Member',
          phone: '+84901234567',
          scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days future
          partySize: 2,
        },
      );

      // Verify that findFirst was called for coupon but without restricting storeId to target-club
      expect(prisma.coupon.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 'coupon-vip10',
            status: 'ACTIVE',
          }),
        }),
      );
      // Ensure targetStore was NOT enforced on the coupon where clause
      const couponWhereCall = prisma.coupon.findFirst.mock.calls[0][0].where;
      expect(couponWhereCall).not.toHaveProperty('storeId');

      // Verify booking creation succeeded and is linked to the coupon and issue
      expect(prisma.booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            storeId: 'store-target',
            couponId: 'coupon-vip10',
            couponIssueId: 'issue-vip-123',
          }),
        }),
      );
    });

    it('enforces store checks for normal coupons (non-default ones) and throws if store mismatches', async () => {
      prisma.store.findFirst.mockResolvedValue({
        id: 'store-target',
        name: 'Target Club',
        slug: 'target-club',
      });

      prisma.coupon.findMany.mockResolvedValue([
        { id: 'coupon-vip10', code: 'VIP10' },
      ] as any);

      // Mock finding a custom non-default coupon (e.g. SUMMER20) belonging to store-other
      prisma.coupon.findFirst.mockResolvedValue(null); // Not found because it checks storeId = store-target

      await expect(
        service.createMemberBooking(
          { id: 'member-2', role: 'USER', tier: 'VIP' },
          {
            storeSlug: 'target-club',
            couponId: 'coupon-summer20', // non-default coupon
            displayName: 'VIP Member',
            phone: '+84901234567',
            scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(),
            partySize: 2,
          },
        ),
      ).rejects.toThrow(NotFoundException);

      // Verify storeId constraint was applied in where clause for non-default coupons
      expect(prisma.coupon.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 'coupon-summer20',
            storeId: 'store-target', // Constraint enforced!
          }),
        }),
      );
    });

    it('allows booking using an existing couponIssueId for default coupons even if the issue was for another store', async () => {
      prisma.store.findFirst.mockResolvedValue({
        id: 'store-target',
        name: 'Target Club',
        slug: 'target-club',
      });

      // Mock the couponIssue lookup returning a GUEST5 issue configured for store-other
      prisma.couponIssue.findFirst.mockResolvedValue({
        id: 'issue-guest5',
        couponId: 'coupon-guest5-id',
        userId: 'member-3',
        status: 'ISSUED',
        expiresAt: null,
        booking: null,
        coupon: {
          id: 'coupon-guest5-id',
          storeId: 'store-other', // Mismatch!
          code: 'GUEST5', // Default coupon!
        },
      } as any);

      prisma.guest.create.mockResolvedValue({ id: 'guest-1' });
      prisma.booking.count.mockResolvedValue(0);
      prisma.booking.findFirst.mockResolvedValue(null);
      prisma.booking.create.mockResolvedValue({
        id: 'booking-1',
        status: 'REQUESTED',
      });

      await service.createMemberBooking(
        { id: 'member-3', role: 'USER', tier: 'REGULAR' },
        {
          storeSlug: 'target-club',
          couponIssueId: 'issue-guest5',
          displayName: 'Regular Member',
          phone: '+84901234567',
          scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(),
          partySize: 2,
        },
      );

      // Should bypass store validation and link the coupon issue successfully
      expect(prisma.booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            storeId: 'store-target',
            couponId: 'coupon-guest5-id',
            couponIssueId: 'issue-guest5',
          }),
        }),
      );
    });
  });

  describe('2. VIP, Member, and Guest tier validations for Admin Coupons', () => {
    const adminCouponMock = {
      id: 'admin-coupon-vip',
      code: 'ADMIN_VIP_50',
      status: 'ACTIVE',
      startsAt: new Date(Date.now() - 3600000), // 1 hour ago
      endsAt: null,
      usageLimit: 100,
      usedCount: 0,
      discountType: 'PERCENT',
      discountValue: 50,
      name: 'Admin VIP 50%',
      targetAudiences: ['VIP'],
    };

    it('allows a VIP user to claim an Admin Coupon targeted at VIP tier', async () => {
      prisma.adminCoupon.findFirst.mockResolvedValue(adminCouponMock as any);
      prisma.adminCouponIssue.findFirst.mockResolvedValue(null);
      prisma.adminCouponIssue.create.mockResolvedValue({
        id: 'admin-issue-1',
        status: 'ISSUED',
        code: 'MEMBER-admin-issue-1',
        metadata: {},
      } as any);

      const result = await service.claimAdminGlobalCouponForMember(
        'admin-coupon-vip',
        { id: 'user-vip', role: 'USER', tier: 'VIP' } as AuthenticatedUser,
      );

      expect(result).toBeDefined();
      expect(prisma.adminCouponIssue.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-vip',
            adminCouponId: 'admin-coupon-vip',
          }),
        }),
      );
    });


  });

  describe('3. Store scope targetStores constraints for Admin Coupons', () => {
    it('blocks booking at store-target if Admin Coupon specifies targetStores constraint not including store-target', async () => {
      prisma.store.findFirst.mockResolvedValue({
        id: 'store-target',
        name: 'Target Club',
        slug: 'target-club',
      });

      prisma.adminCouponIssue.findFirst.mockResolvedValue({
        id: 'admin-issue-store-restricted',
        status: 'ISSUED',
        expiresAt: null,
        adminCoupon: {
          id: 'admin-coupon-restricted',
          status: 'ACTIVE',
          startsAt: new Date(Date.now() - 3600000),
          endsAt: null,
          targetAudiences: [],
          targetStores: ['store-other-1', 'store-other-2'], // Does not include store-target!
          discountType: 'PERCENT',
          discountValue: 20,
          code: 'RESTRICTED_20',
        },
      } as any);

      prisma.guest.create.mockResolvedValue({ id: 'guest-1' });
      prisma.booking.count.mockResolvedValue(0);
      prisma.booking.findFirst.mockResolvedValue(null);

      await expect(
        service.createMemberBooking(
          { id: 'member-5', role: 'USER', tier: 'VIP' },
          {
            storeSlug: 'target-club',
            adminCouponIssueId: 'admin-issue-store-restricted',
            displayName: 'VIP Member',
            phone: '+84901234567',
            scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(),
            partySize: 2,
          },
        ),
      ).rejects.toThrow(
        new UnprocessableEntityException('Store is not eligible for this admin coupon'),
      );
    });

    it('allows booking at store-target if Admin Coupon specifies targetStores containing store-target', async () => {
      prisma.store.findFirst.mockResolvedValue({
        id: 'store-target',
        name: 'Target Club',
        slug: 'target-club',
      });

      prisma.adminCouponIssue.findFirst.mockResolvedValue({
        id: 'admin-issue-store-eligible',
        status: 'ISSUED',
        expiresAt: null,
        adminCoupon: {
          id: 'admin-coupon-eligible',
          status: 'ACTIVE',
          startsAt: new Date(Date.now() - 3600000),
          endsAt: null,
          targetAudiences: [],
          targetStores: ['store-target', 'store-other-2'], // Contains store-target!
          discountType: 'PERCENT',
          discountValue: 20,
          code: 'ELIGIBLE_20',
        },
      } as any);

      prisma.guest.create.mockResolvedValue({ id: 'guest-1' });
      prisma.booking.count.mockResolvedValue(0);
      prisma.booking.findFirst.mockResolvedValue(null);
      prisma.booking.create.mockResolvedValue({
        id: 'booking-1',
        status: 'REQUESTED',
      });

      const booking = await service.createMemberBooking(
        { id: 'member-6', role: 'USER', tier: 'VIP' },
        {
          storeSlug: 'target-club',
          adminCouponIssueId: 'admin-issue-store-eligible',
          displayName: 'VIP Member',
          phone: '+84901234567',
          scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(),
          partySize: 2,
        },
      );

      expect(booking).toBeDefined();
      expect(prisma.booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            storeId: 'store-target',
            discountSnapshot: expect.objectContaining({
              adminCouponIssueId: 'admin-issue-store-eligible',
              code: 'ELIGIBLE_20',
            }),
          }),
        }),
      );
    });
  });

  describe('4. Used count limits and duplicate claim prevention', () => {
    it('rejects claim for Admin Coupon if usedCount has reached usageLimit', async () => {
      prisma.adminCoupon.findFirst.mockResolvedValue({
        id: 'admin-coupon-limited',
        status: 'ACTIVE',
        startsAt: new Date(Date.now() - 3600000),
        endsAt: null,
        usageLimit: 50,
        usedCount: 50, // Reached limit!
        discountType: 'PERCENT',
        discountValue: 20,
      } as any);

      await expect(
        service.claimAdminGlobalCouponForMember('admin-coupon-limited', {
          id: 'user-vip',
          role: 'USER',
          tier: 'VIP',
        } as AuthenticatedUser),
      ).rejects.toThrow(
        new UnprocessableEntityException('Admin coupon usage limit reached'),
      );
    });

    it('rejects claim if user has already claimed the same Admin Coupon (duplicate claim prevention)', async () => {
      prisma.adminCoupon.findFirst.mockResolvedValue({
        id: 'admin-coupon-limited',
        status: 'ACTIVE',
        startsAt: new Date(Date.now() - 3600000),
        endsAt: null,
        usageLimit: 50,
        usedCount: 10,
        discountType: 'PERCENT',
        discountValue: 20,
      } as any);

      // Mock that an existing issue already exists for this user
      prisma.adminCouponIssue.findFirst.mockResolvedValue({
        id: 'existing-issue-id',
        status: 'ISSUED',
      } as any);

      await expect(
        service.claimAdminGlobalCouponForMember('admin-coupon-limited', {
          id: 'user-vip',
          role: 'USER',
          tier: 'VIP',
        } as AuthenticatedUser),
      ).rejects.toThrow(
        new UnprocessableEntityException('You have already claimed this coupon'),
      );
    });

    it('rejects guest claim if guest phone has already claimed the same Admin Coupon', async () => {
      prisma.adminCoupon.findFirst.mockResolvedValue({
        id: 'admin-coupon-limited',
        status: 'ACTIVE',
        startsAt: new Date(Date.now() - 3600000),
        endsAt: null,
        usageLimit: 50,
        usedCount: 10,
        discountType: 'PERCENT',
        discountValue: 20,
      } as any);

      prisma.guest.findFirst.mockResolvedValue({ id: 'guest-1' } as any);

      // Mock that an existing issue already exists for this guest
      prisma.adminCouponIssue.findFirst.mockResolvedValue({
        id: 'existing-guest-issue-id',
        status: 'USED',
      } as any);

      await expect(
        service.claimAdminGlobalCouponForGuest('admin-coupon-limited', {
          phone: '+84901234567',
          displayName: 'Guest Name',
        }),
      ).rejects.toThrow(
        new UnprocessableEntityException('This phone has already claimed this coupon'),
      );
    });
  });
});
