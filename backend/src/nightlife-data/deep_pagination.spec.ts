import { NightlifeDataService } from './nightlife-data.service';

describe('Deep Pagination Stress Test (>60 items)', () => {
  let service: NightlifeDataService;
  let prisma: any;
  let accessService: any;

  let mockBills: any[] = [];
  let mockCoupons: any[] = [];
  let mockBookings: any[] = [];

  const partnerUser = {
    id: 'partner-user-1',
    email: 'partner@example.com',
    role: 'PARTNER',
  };

  beforeEach(() => {
    mockBills = [];
    mockCoupons = [];
    mockBookings = [];

    const baseTime = new Date('2026-08-05T12:00:00.000Z').getTime();

    // 42 Bills with decreasing timestamps (some identical)
    for (let i = 1; i <= 42; i++) {
      const minuteOffset = i >= 10 && i <= 15 ? 100 : i * 10;
      const submittedAt = new Date(baseTime - minuteOffset * 60 * 1000);
      mockBills.push({
        id: `b${String(i).padStart(3, '0')}`,
        submittedAt,
        createdAt: submittedAt,
        storeId: 'store-1',
        status: 'VERIFIED',
        totalVnd: 1000000 + i * 1000,
        discountVnd: 100000,
        store: { name: 'Club Alpha' },
        user: { displayName: `User B${i}`, phone: `090${i}`, tier: 'MEMBER' },
        guest: null,
        couponIssue: null,
        booking: null,
        bookingId: null,
        couponIssueId: null,
        billNumber: `BILL-${i}`,
      });
    }

    // 42 CouponIssues with decreasing timestamps
    for (let i = 1; i <= 42; i++) {
      const minuteOffset = i >= 10 && i <= 15 ? 100 : i * 10 + 5;
      const usedAt = new Date(baseTime - minuteOffset * 60 * 1000);
      mockCoupons.push({
        id: `c${String(i).padStart(3, '0')}`,
        code: `COUPON-${i}`,
        status: 'USED',
        usedAt,
        updatedAt: usedAt,
        createdAt: usedAt,
        coupon: { storeId: 'store-1', store: { name: 'Club Alpha' } },
        user: { displayName: `User C${i}`, phone: `091${i}`, tier: 'GUEST' },
        guest: null,
        booking: null,
      });
    }

    // 41 Bookings with decreasing timestamps
    for (let i = 1; i <= 41; i++) {
      const minuteOffset = i >= 10 && i <= 15 ? 100 : i * 10 + 2;
      const scheduledAt = new Date(baseTime - minuteOffset * 60 * 1000);
      mockBookings.push({
        id: `bk${String(i).padStart(3, '0')}`,
        bookingCode: `BK-${i}`,
        status: 'CHECKED_IN',
        scheduledAt,
        createdAt: scheduledAt,
        storeId: 'store-1',
        totalVnd: 2000000,
        discountVnd: 200000,
        store: { name: 'Club Alpha' },
        user: { displayName: `User BK${i}`, phone: `092${i}`, tier: 'VIP' },
        guest: null,
        bill: null,
        couponIssue: null,
        couponIssueId: null,
      });
    }

    prisma = {
      bill: {
        findMany: jest.fn().mockImplementation((args: any) => {
          let items = [...mockBills];

          if (args.where?.storeId?.in) {
            items = items.filter((b) => args.where.storeId.in.includes(b.storeId));
          }

          if (args.where?.AND) {
            for (const cond of args.where.AND) {
              if (cond.OR) {
                items = items.filter((b) => {
                  return cond.OR.some((orClause: any) => {
                    if (orClause.submittedAt?.lt) {
                      return b.submittedAt < orClause.submittedAt.lt;
                    }
                    if (orClause.submittedAt && orClause.id?.lt) {
                      return (
                        b.submittedAt.getTime() === new Date(orClause.submittedAt).getTime() &&
                        b.id < orClause.id.lt
                      );
                    }
                    if (orClause.submittedAt && !orClause.id) {
                      return b.submittedAt.getTime() === new Date(orClause.submittedAt).getTime();
                    }
                    return false;
                  });
                });
              }
            }
          }

          items.sort((a, b) => {
            if (b.submittedAt.getTime() !== a.submittedAt.getTime()) {
              return b.submittedAt.getTime() - a.submittedAt.getTime();
            }
            return b.id.localeCompare(a.id);
          });

          if (args.take) {
            items = items.slice(0, args.take);
          }
          return items;
        }),
      },
      couponIssue: {
        findMany: jest.fn().mockImplementation((args: any) => {
          let items = [...mockCoupons];

          if (args.where?.AND) {
            for (const cond of args.where.AND) {
              if (cond.OR) {
                items = items.filter((c) => {
                  return cond.OR.some((orClause: any) => {
                    if (orClause.usedAt?.lt) {
                      return c.usedAt < orClause.usedAt.lt;
                    }
                    if (orClause.usedAt && orClause.id?.lt) {
                      return (
                        c.usedAt.getTime() === new Date(orClause.usedAt).getTime() &&
                        c.id < orClause.id.lt
                      );
                    }
                    return false;
                  });
                });
              }
            }
          }

          items.sort((a, b) => {
            if (b.usedAt.getTime() !== a.usedAt.getTime()) {
              return b.usedAt.getTime() - a.usedAt.getTime();
            }
            return b.id.localeCompare(a.id);
          });

          if (args.take) {
            items = items.slice(0, args.take);
          }
          return items;
        }),
      },
      booking: {
        findMany: jest.fn().mockImplementation((args: any) => {
          let items = [...mockBookings];

          if (args.where?.AND) {
            for (const cond of args.where.AND) {
              if (cond.OR) {
                items = items.filter((bk) => {
                  return cond.OR.some((orClause: any) => {
                    if (orClause.scheduledAt?.lt) {
                      return bk.scheduledAt < orClause.scheduledAt.lt;
                    }
                    if (orClause.scheduledAt && orClause.id?.lt) {
                      return (
                        bk.scheduledAt.getTime() === new Date(orClause.scheduledAt).getTime() &&
                        bk.id < orClause.id.lt
                      );
                    }
                    if (orClause.scheduledAt && !orClause.id) {
                      return bk.scheduledAt.getTime() === new Date(orClause.scheduledAt).getTime();
                    }
                    return false;
                  });
                });
              }
            }
          }

          items.sort((a, b) => {
            if (b.scheduledAt.getTime() !== a.scheduledAt.getTime()) {
              return b.scheduledAt.getTime() - a.scheduledAt.getTime();
            }
            return b.id.localeCompare(a.id);
          });

          if (args.take) {
            items = items.slice(0, args.take);
          }
          return items;
        }),
      },
    };

    accessService = {
      getAccessibleStoreIds: jest.fn().mockResolvedValue(['store-1']),
      ensureStoreAccess: jest.fn().mockResolvedValue(undefined),
    };

    service = new NightlifeDataService(
      prisma as any,
      accessService as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );
  });

  it('paginates continuously across 125 items (>60 items, 7 pages) without loss, duplication, or ordering bugs', async () => {
    const pageSize = 20;
    const allFetchedItems: any[] = [];
    let currentCursor: string | undefined = undefined;
    let pageCount = 0;
    let hasMore = true;

    while (hasMore) {
      pageCount++;
      const result: any = await service.getPartnerActivities(partnerUser, {
        cursor: currentCursor,
        limit: pageSize,
      });

      expect(result.data).toBeDefined();
      allFetchedItems.push(...result.data);

      if (pageCount < 7) {
        expect(result.data.length).toBe(pageSize);
        expect(result.hasMore).toBe(true);
        expect(result.nextCursor).not.toBeNull();
        expect(typeof result.nextCursor).toBe('string');
      } else if (pageCount === 7) {
        expect(result.data.length).toBe(5);
        expect(result.hasMore).toBe(false);
        expect(result.nextCursor).toBeNull();
      } else {
        fail(`Unexpected pageCount: ${pageCount}`);
      }

      hasMore = result.hasMore;
      currentCursor = result.nextCursor ?? undefined;
    }

    expect(pageCount).toBe(7);
    expect(allFetchedItems.length).toBe(125);

    // Assert 1: Deduplication check (all IDs unique)
    const fetchedIds = allFetchedItems.map((item) => item.id);
    const uniqueIds = new Set(fetchedIds);
    expect(uniqueIds.size).toBe(125);

    // Assert 2: Strict order check (activityAt DESC, id DESC)
    for (let i = 0; i < allFetchedItems.length - 1; i++) {
      const current = allFetchedItems[i];
      const next = allFetchedItems[i + 1];

      const currentTime = new Date(current.activityAt).getTime();
      const nextTime = new Date(next.activityAt).getTime();

      if (currentTime === nextTime) {
        expect(current.id.localeCompare(next.id)).toBeGreaterThan(0);
      } else {
        expect(currentTime).toBeGreaterThan(nextTime);
      }
    }
  });

  it('handles empty query after dataset exhaustion', async () => {
    const page1: any = await service.getPartnerActivities(partnerUser, { limit: 50 });
    const page2: any = await service.getPartnerActivities(partnerUser, { cursor: page1.nextCursor, limit: 50 });
    const page3: any = await service.getPartnerActivities(partnerUser, { cursor: page2.nextCursor, limit: 50 });

    expect(page3.data.length).toBe(25);
    expect(page3.hasMore).toBe(false);
    expect(page3.nextCursor).toBeNull();

    const lastValidCursor = encodeCursor('1970-01-01T00:00:00.000Z', 'bill:b000');
    const emptyResult: any = await service.getPartnerActivities(partnerUser, { cursor: lastValidCursor, limit: 20 });
    expect(emptyResult.data).toEqual([]);
    expect(emptyResult.hasMore).toBe(false);
    expect(emptyResult.nextCursor).toBeNull();
  });
});

function encodeCursor(activityAt: string, id: string): string {
  const payload = `${activityAt}_${id}`;
  return Buffer.from(payload, 'utf-8').toString('base64');
}
