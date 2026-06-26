import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { PasswordService } from '../src/common/password.service';
import { seedAll } from './seed/index';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? '',
  }),
});
const passwordService = new PasswordService();

async function main() {
  const passwordHash = await passwordService.hash('Str0ngPass!');
  await seedAll(prisma, passwordHash);
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    process.exit(1);
  });
