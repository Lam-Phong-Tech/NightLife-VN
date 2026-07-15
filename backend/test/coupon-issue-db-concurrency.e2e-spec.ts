import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { createHash, randomUUID } from 'node:crypto';
import { NightlifeDataService } from '../src/nightlife-data/nightlife-data.service';

const runDatabaseE2e =
  process.env.NIGHTLIFE_RUN_DB_E2E === 'true' &&
  Boolean(process.env.DATABASE_URL);
const describeDb = runDatabaseE2e ? describe : describe.skip;

describeDb('CouponIssue one-time update with a real database (e2e)', () => {
  jest.setTimeout(30_000);

  let prisma: PrismaClient;
  const createdIssueIds: string[] = [];
  const createdGuestPhones: string[] = [];
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
    await prisma.guest.deleteMany({
      where: { phone: { in: createdGuestPhones } },
    });
    await prisma.coupon.deleteMany({
      where: { id: { in: createdCouponIds } },
    });
    await prisma.store.deleteMany({
      where: { id: { in: createdStoreIds } },
    });
    await prisma.$disconnect();
  });

  const createStoreFixture = async (name: string, slug: string) => {
    const id = randomUUID();
    await prisma.$executeRaw`
      INSERT INTO "stores" (
        "id",
        "name",
        "slug",
        "category",
        "status",
        "city",
        "created_at",
        "updated_at"
      )
      VALUES (
        ${id}::uuid,
        ${name},
        ${slug},
        'BAR'::"StoreCategory",
        'ACTIVE'::"StoreStatus",
        'Ho Chi Minh City',
        NOW(),
        NOW()
      )
    `;
    createdStoreIds.push(id);
    return { id };
  };

  const createValidPhoneFixture = () => {
    const digits = randomUUID().replace(/\D/g, '').padEnd(8, '0').slice(0, 8);
    return `+8490${digits}`;
  };

  it('allows exactly one concurrent ISSUED to USED transition', async () => {
    const suffix = randomUUID().slice(0, 8);
    const store = await createStoreFixture(
      `DB E2E Store ${suffix}`,
      `db-e2e-store-${suffix}`,
    );

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

  it('rolls back a Booking QR coupon issue when booking create fails after issue creation', async () => {
    const suffix = randomUUID().slice(0, 8);
    const store = await createStoreFixture(
      `DB QR Rollback Store ${suffix}`,
      `db-qr-rollback-store-${suffix}`,
    );

    const coupon = await prisma.coupon.create({
      data: {
        storeId: store.id,
        code: `DB-ROLLBACK-${suffix}`,
        name: 'DB Rollback Booking QR',
        discountType: 'PERCENT',
        discountValue: 5,
        startsAt: new Date(Date.now() - 60_000),
        status: 'ACTIVE',
      },
      select: { id: true },
    });
    createdCouponIds.push(coupon.id);

    const phone = createValidPhoneFixture();
    createdGuestPhones.push(phone);
    const failingPrisma = prisma.$extends({
      query: {
        booking: {
          async create() {
            throw new Error('Simulated booking create failure after QR issue');
          },
        },
      },
    });
    const service = new NightlifeDataService(
      failingPrisma as never,
      {
        ensureStoreAccess: jest.fn(),
        getAccessibleStoreIds: jest.fn(),
      } as never,
    );

    await expect(
      service.createGuestBooking({
        storeId: store.id,
        couponId: coupon.id,
        displayName: 'Rollback Guest',
        phone,
        scheduledAt: new Date(
          Date.now() + 2 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        partySize: 2,
      }),
    ).rejects.toThrow('Simulated booking create failure after QR issue');

    await expect(
      prisma.couponIssue.findMany({
        where: { couponId: coupon.id },
        select: { id: true, code: true },
      }),
    ).resolves.toEqual([]);
  });
});
