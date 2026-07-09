import { PrismaClient, SystemConfig } from '@prisma/client';

export async function seedSystemConfigs(
  prisma: PrismaClient,
): Promise<Record<string, SystemConfig>> {
  console.log('  ⚙️  Seeding system configs...');
  const result: Record<string, SystemConfig> = {};

  const configs = [
    {
      key: 'VPS_MAX_STORAGE_GB',
      value: { limit: 50 }, // Default 50GB
    },
  ];

  for (const c of configs) {
    result[c.key] = await prisma.systemConfig.upsert({
      where: { key: c.key },
      update: { value: c.value },
      create: { key: c.key, value: c.value },
    });
  }

  console.log(`     ✓ ${Object.keys(result).length} system configs`);
  return result;
}
