import { PrismaClient, Store, User } from '@prisma/client';

const DEMO_PARTNER_STORE_PERMISSIONS = [
  'store.partner.view',
  'coupon.partner.view',
  'booking.partner.view',
  'bill.partner.view',
  'coupon.scan',
  'checkin.confirm',
];

export async function seedStorePermissions(
  prisma: PrismaClient,
  users: Record<string, User>,
  stores: Record<string, Store>,
) {
  console.log('  Seeding per-store permissions...');

  const demoPartner = users['partner'];
  if (!demoPartner) {
    return;
  }

  const scopedStores = ['velvet-club']
    .map((slug) => stores[slug])
    .filter(Boolean);
  const scopedStoreIds = scopedStores.map((store) => store.id);

  if (scopedStoreIds.length) {
    await prisma.storePermission.updateMany({
      where: {
        userId: demoPartner.id,
        deletedAt: null,
        storeId: { notIn: scopedStoreIds },
      },
      data: {
        status: 'DELETED',
        deletedAt: new Date(),
      },
    });
  }

  for (const store of scopedStores) {
    await prisma.storePermission.upsert({
      where: {
        userId_storeId: {
          userId: demoPartner.id,
          storeId: store.id,
        },
      },
      update: {
        permissions: DEMO_PARTNER_STORE_PERMISSIONS,
        status: 'ACTIVE',
        deletedAt: null,
      },
      create: {
        userId: demoPartner.id,
        storeId: store.id,
        permissions: DEMO_PARTNER_STORE_PERMISSIONS,
        status: 'ACTIVE',
      },
    });
  }

  console.log(`     ${scopedStores.length} store permission rows`);
}
