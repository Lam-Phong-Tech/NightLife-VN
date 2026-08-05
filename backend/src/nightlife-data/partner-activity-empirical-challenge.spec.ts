import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AccessService } from '../access/access.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  decodeCursor,
  encodeCursor,
  PartnerActivityQueryDto,
} from './dto/partner-activity-query.dto';
import { NightlifeDataService } from './nightlife-data.service';

describe('PR2 Service & Pagination Empirical Challenge', () => {
  const partnerUser = {
    id: 'partner-user-1',
    email: 'partner@example.com',
    role: 'PARTNER',
  };

  const prisma = {
    $transaction: jest.fn(),
    bill: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    couponIssue: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    booking: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  } as unknown as jest.Mocked<PrismaService>;

  const accessService = {
    getAccessibleStoreIds: jest.fn(),
    ensureStoreAccess: jest.fn(),
  } as unknown as jest.Mocked<AccessService>;

  let service: NightlifeDataService;

  beforeEach(() => {
    jest.clearAllMocks();
    accessService.getAccessibleStoreIds.mockResolvedValue(['store-1']);
    accessService.ensureStoreAccess.mockResolvedValue(undefined);
    service = new NightlifeDataService(
      prisma,
      accessService,
      undefined as any,
      undefined,
      undefined as any,
      undefined as any,
    );
  });

  describe('Scenario 1: Compound cursor pagination (activityAt DESC, id DESC)', () => {
    it('asserts deterministic ordering when multiple items share identical activityAt timestamps', async () => {
      const identicalTime = '2026-08-05T12:00:00.000Z';
      
      prisma.bill.findMany.mockResolvedValue([
        {
          id: 'b2',
          submittedAt: new Date(identicalTime),
          storeId: 'store-1',
          status: 'VERIFIED',
          totalVnd: 1000000,
          store: { name: 'Club Alpha' },
        },
        {
          id: 'b1',
          submittedAt: new Date(identicalTime),
          storeId: 'store-1',
          status: 'VERIFIED',
          totalVnd: 500000,
          store: { name: 'Club Alpha' },
        },
      ] as never);

      prisma.couponIssue.findMany.mockResolvedValue([
        {
          id: 'c1',
          code: 'COUPON1',
          status: 'USED',
          usedAt: new Date(identicalTime),
          coupon: { storeId: 'store-1', store: { name: 'Club Alpha' } },
        },
      ] as never);

      prisma.booking.findMany.mockResolvedValue([
        {
          id: 'bk1',
          bookingCode: 'BK100',
          scheduledAt: new Date(identicalTime),
          storeId: 'store-1',
          status: 'CHECKED_IN',
          store: { name: 'Club Alpha' },
        },
      ] as never);

      // Total 4 items all sharing 2026-08-05T12:00:00.000Z:
      // Item IDs: bill:b2, bill:b1, coupon:c1, booking:bk1
      // Expected sorted order (b.id DESC):
      // 1. coupon:c1 ('coupon:c1' > 'booking:bk1' > 'bill:b2' > 'bill:b1')
      // 2. booking:bk1
      // 3. bill:b2
      // 4. bill:b1

      // Fetch Page 1 with limit 2
      const page1 = await service.getPartnerActivities(partnerUser, { limit: 2 });
      expect(page1.data).toHaveLength(2);
      expect(page1.data[0].id).toBe('coupon:c1');
      expect(page1.data[1].id).toBe('booking:bk1');
      expect(page1.hasMore).toBe(true);
      expect(page1.nextCursor).toBe(encodeCursor(identicalTime, 'booking:bk1'));

      // Fetch Page 2 using cursor from Page 1
      const page2 = await service.getPartnerActivities(partnerUser, {
        limit: 2,
        cursor: page1.nextCursor!,
      });
      expect(page2.data).toHaveLength(2);
      expect(page2.data[0].id).toBe('bill:b2');
      expect(page2.data[1].id).toBe('bill:b1');
      expect(page2.hasMore).toBe(false);
      expect(page2.nextCursor).toBeNull();
    });

    it('exposes page truncation flaw when total items exceed limit * 3 without DB-level cursor filtering', async () => {
      // Create 10 bills with sequential timestamps
      const totalBills = Array.from({ length: 10 }, (_, i) => ({
        id: `b${10 - i}`, // b10 down to b1
        submittedAt: new Date(1000000000000 + (10 - i) * 1000),
        storeId: 'store-1',
        status: 'VERIFIED',
        store: { name: 'Club Alpha' },
      }));

      // limit = 2 => limit * 3 = 6
      // When prisma.bill.findMany is called, it takes limit * 3 = 6 items (b10, b9, b8, b7, b6, b5)
      prisma.bill.findMany.mockImplementation((args: any) => {
        const take = args.take || 6;
        return Promise.resolve(totalBills.slice(0, take) as never);
      });
      prisma.couponIssue.findMany.mockResolvedValue([] as never);
      prisma.booking.findMany.mockResolvedValue([] as never);

      // Page 1 (limit 2): returns b10, b9
      const p1 = await service.getPartnerActivities(partnerUser, { limit: 2 });
      expect(p1.data.map((d) => d.id)).toEqual(['bill:b10', 'bill:b9']);

      // Page 2 (limit 2, cursor b9): returns b8, b7
      const p2 = await service.getPartnerActivities(partnerUser, { limit: 2, cursor: p1.nextCursor! });
      expect(p2.data.map((d) => d.id)).toEqual(['bill:b8', 'bill:b7']);

      // Page 3 (limit 2, cursor b7): returns b6, b5
      const p3 = await service.getPartnerActivities(partnerUser, { limit: 2, cursor: p2.nextCursor! });
      expect(p3.data.map((d) => d.id)).toEqual(['bill:b6', 'bill:b5']);

      // EMPIRICAL BUG DEMONSTRATION:
      // p3 returns b6, b5, but claims hasMore: false (and nextCursor: null)
      // because DB query was capped at limit * 3 (6 items), prematurely truncating b4..b1!
      expect(p3.data.map((d) => d.id)).toEqual(['bill:b6', 'bill:b5']);
      expect(p3.hasMore).toBe(false);
      expect(p3.nextCursor).toBeNull();
    });
  });

  describe('Scenario 2: Base64 cursor token parsing', () => {
    it('correctly encodes and decodes valid cursor tokens', () => {
      const dateStr = '2026-08-05T14:00:00.000Z';
      const idStr = 'bill:b123_456';
      const token = encodeCursor(dateStr, idStr);
      expect(typeof token).toBe('string');
      expect(token).not.toBe('');

      const decoded = decodeCursor(token);
      expect(decoded).toEqual({
        activityAt: dateStr,
        id: idStr,
      });
    });

    it('returns null for empty or undefined cursors', () => {
      expect(decodeCursor(undefined)).toBeNull();
      expect(decodeCursor('')).toBeNull();
    });

    it('returns null for malformed cursor strings', () => {
      // String without underscore separator
      const noSep = Buffer.from('2026-08-05T14:00:00.000Z').toString('base64');
      expect(decodeCursor(noSep)).toBeNull();

      // Missing date before underscore
      const noDate = Buffer.from('_bill:b1').toString('base64');
      expect(decodeCursor(noDate)).toBeNull();

      // Invalid date string
      const invalidDate = Buffer.from('invalid-date_bill:b1').toString('base64');
      expect(decodeCursor(invalidDate)).toBeNull();

      // Missing ID after underscore
      const noId = Buffer.from('2026-08-05T14:00:00.000Z_').toString('base64');
      expect(decodeCursor(noId)).toBeNull();

      // Invalid characters
      expect(decodeCursor('!!!not_base64!!!')).toBeNull();
    });

    it('handles edge-of-page cursors gracefully', async () => {
      prisma.bill.findMany.mockResolvedValue([
        {
          id: 'b1',
          submittedAt: new Date('2026-08-05T10:00:00.000Z'),
          storeId: 'store-1',
          status: 'VERIFIED',
          store: { name: 'Club Alpha' },
        },
      ] as never);
      prisma.couponIssue.findMany.mockResolvedValue([] as never);
      prisma.booking.findMany.mockResolvedValue([] as never);

      // Request with cursor pointing exactly to b1
      const cursor = encodeCursor('2026-08-05T10:00:00.000Z', 'bill:b1');
      const result = await service.getPartnerActivities(partnerUser, { cursor, limit: 10 });

      expect(result.data).toHaveLength(0);
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
    });
  });

  describe('Scenario 3: Filter combinations', () => {
    it('filters strictly by activity type', async () => {
      prisma.bill.findMany.mockResolvedValue([
        {
          id: 'b1',
          submittedAt: new Date('2026-08-05T10:00:00.000Z'),
          storeId: 'store-1',
          status: 'VERIFIED',
          store: { name: 'Club Alpha' },
        },
      ] as never);
      prisma.couponIssue.findMany.mockResolvedValue([] as never);
      prisma.booking.findMany.mockResolvedValue([] as never);

      // type = BILL_PAYMENT
      await service.getPartnerActivities(partnerUser, { type: 'BILL_PAYMENT' });
      expect(prisma.bill.findMany).toHaveBeenCalled();
      expect(prisma.couponIssue.findMany).not.toHaveBeenCalled();
      expect(prisma.booking.findMany).not.toHaveBeenCalled();

      jest.clearAllMocks();
      accessService.getAccessibleStoreIds.mockResolvedValue(['store-1']);

      // type = COUPON_USAGE
      await service.getPartnerActivities(partnerUser, { type: 'COUPON_USAGE' });
      expect(prisma.bill.findMany).not.toHaveBeenCalled();
      expect(prisma.couponIssue.findMany).toHaveBeenCalled();
      expect(prisma.booking.findMany).not.toHaveBeenCalled();
    });

    it('applies startDate, endDate, and search filters across prisma queries', async () => {
      prisma.bill.findMany.mockResolvedValue([] as never);
      prisma.couponIssue.findMany.mockResolvedValue([] as never);
      prisma.booking.findMany.mockResolvedValue([] as never);

      const dto: PartnerActivityQueryDto = {
        type: 'ALL',
        startDate: '2026-08-01T00:00:00.000Z',
        endDate: '2026-08-05T23:59:59.999Z',
        search: 'VIP123',
        limit: 10,
      };

      await service.getPartnerActivities(partnerUser, dto);

      expect(prisma.bill.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            submittedAt: {
              gte: new Date('2026-08-01T00:00:00.000Z'),
              lte: new Date('2026-08-05T23:59:59.999Z'),
            },
            OR: expect.arrayContaining([
              { billNumber: { contains: 'VIP123', mode: 'insensitive' } },
            ]),
          }),
        }),
      );

      expect(prisma.couponIssue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            usedAt: {
              gte: new Date('2026-08-01T00:00:00.000Z'),
              lte: new Date('2026-08-05T23:59:59.999Z'),
            },
            OR: expect.arrayContaining([
              { code: { contains: 'VIP123', mode: 'insensitive' } },
            ]),
          }),
        }),
      );

      expect(prisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            scheduledAt: {
              gte: new Date('2026-08-01T00:00:00.000Z'),
              lte: new Date('2026-08-05T23:59:59.999Z'),
            },
            OR: expect.arrayContaining([
              { bookingCode: { contains: 'VIP123', mode: 'insensitive' } },
            ]),
          }),
        }),
      );
    });
  });
});
