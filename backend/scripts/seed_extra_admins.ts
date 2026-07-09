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

  console.log('Seeding 3 Super Admins...');
  for (let i = 1; i <= 3; i++) {
    await prisma.user.upsert({
      where: { email: `superadmin${i}@nightlife.vn` },
      update: {},
      create: {
        email: `superadmin${i}@nightlife.vn`,
        passwordHash: passwordHash,
        displayName: `Super Admin ${i}`,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
      },
    });
  }

  console.log('Seeding 3 Admins...');
  for (let i = 1; i <= 3; i++) {
    await prisma.user.upsert({
      where: { email: `admin${i}@nightlife.vn` },
      update: {},
      create: {
        email: `admin${i}@nightlife.vn`,
        passwordHash: passwordHash,
        displayName: `Admin ${i}`,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });
  }

  console.log('Seeding completed.');
}

main()
  .finally(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
