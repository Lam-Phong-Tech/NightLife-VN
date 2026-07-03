import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { createHash, randomUUID } from 'node:crypto';

const runDatabaseE2e =
  process.env.NIGHTLIFE_RUN_DB_E2E === 'true' &&
  Boolean(process.env.DATABASE_URL);
const describeDb = runDatabaseE2e ? describe : describe.skip;

describeDb('CouponIssue one-time update with a real database (e2e)', () => {
  jest.setTimeout(30_000);

  let prisma: PrismaClient;
  const createdIssueIds: string[] = [];
  const createdCouponIds: string[] = [];
  const createdStoreIds: string[] = [];

  beforeAll(async () => {
    prisma = new PrismaClient({
      adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL!,
      }),
    });
    await prisma.$connect();
  });

  afterAll(async () => {
    if (!prisma) return;
    await prisma.couponIssue.deleteMany({
      where: { id: { in: createdIssueIds } },
    });
    await prisma.coupon.deleteMany({
      where: { id: { in: createdCouponIds } },
    });
    await prisma.store.deleteMany({
      where: { id: { in: createdStoreIds } },
    });
    await prisma.$disconnect();
  });

  it('allows exactly one concurrent ISSUED to USED transition', async () => {
    const suffix = randomUUID().slice(0, 8);
    const store = await prisma.store.create({
      data: {
        name: `DB E2E Store ${suffix}`,
        slug: `db-e2e-store-${suffix}`,
        category: 'BAR',
        status: 'ACTIVE',
      },
      select: { id: true },
    });
    createdStoreIds.push(store.id);

    const coupon = await prisma.coupon.create({
      data: {
        storeId: store.id,
        code: `DB-E2E-${suffix}`,
        name: 'DB E2E Booking QR',
        discountType: 'PERCENT',
        discountValue: 5,
        startsAt: new Date(Date.now() - 60_000),
        status: 'ACTIVE',
      },
      select: { id: true },
    });
    createdCouponIds.push(coupon.id);

    const issueId = randomUUID();
    const issue = await prisma.couponIssue.create({
      data: {
        id: issueId,
        couponId: coupon.id,
        code: `DB-E2E-ISSUE-${suffix}`,
        qrPayloadHash: createHash('sha256').update(issueId).digest('hex'),
        status: 'ISSUED',
        expiresAt: new Date(Date.now() + 60 * 60_000),
      },
      select: { id: true },
    });
    createdIssueIds.push(issue.id);

    const [firstUpdate, secondUpdate] = await Promise.all([
      prisma.couponIssue.updateMany({
        where: { id: issue.id, status: 'ISSUED' },
        data: { status: 'USED', usedAt: new Date() },
      }),
      prisma.couponIssue.updateMany({
        where: { id: issue.id, status: 'ISSUED' },
        data: { status: 'USED', usedAt: new Date() },
      }),
    ]);

    expect(firstUpdate.count + secondUpdate.count).toBe(1);
    await expect(
      prisma.couponIssue.findUnique({
        where: { id: issue.id },
        select: { status: true, usedAt: true },
      }),
    ).resolves.toEqual({
      status: 'USED',
      usedAt: expect.any(Date),
    });
  });
});
