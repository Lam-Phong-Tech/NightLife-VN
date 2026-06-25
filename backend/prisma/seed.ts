import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { PasswordService } from '../src/common/password.service';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? '',
  }),
});
const passwordService = new PasswordService();

async function main() {
  const passwordHash = await passwordService.hash('Str0ngPass!');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@nightlife.vn' },
    update: {
      displayName: 'NightLife Admin',
      role: 'ADMIN',
      tier: 'VIP',
      status: 'ACTIVE',
    },
    create: {
      email: 'admin@nightlife.vn',
      passwordHash,
      displayName: 'NightLife Admin',
      role: 'ADMIN',
      tier: 'VIP',
      status: 'ACTIVE',
    },
  });

  const partner = await prisma.user.upsert({
    where: { email: 'partner@nightlife.vn' },
    update: {
      displayName: 'Demo Partner',
      role: 'PARTNER',
      tier: 'PREMIUM',
      status: 'ACTIVE',
    },
    create: {
      email: 'partner@nightlife.vn',
      passwordHash,
      displayName: 'Demo Partner',
      role: 'PARTNER',
      tier: 'PREMIUM',
      status: 'ACTIVE',
    },
  });

  await prisma.store.upsert({
    where: { slug: 'demo-nightlife-store' },
    update: {
      ownerId: partner.id,
      status: 'ACTIVE',
    },
    create: {
      ownerId: partner.id,
      name: 'Demo NightLife Store',
      slug: 'demo-nightlife-store',
      category: 'CLUB',
      description: 'Demo store for local P0 evidence.',
      address: 'District 1, Ho Chi Minh City',
      city: 'Ho Chi Minh City',
      district: 'District 1',
      status: 'ACTIVE',
    },
  });

  console.log({
    admin: admin.email,
    partner: partner.email,
    password: 'Str0ngPass!',
    store: 'demo-nightlife-store',
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    process.exit(1);
  });
