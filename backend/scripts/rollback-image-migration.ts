import 'dotenv/config';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const manifestOption = args
  .find((argument) => argument.startsWith('--manifest='))
  ?.split('=')[1];
if (!manifestOption) throw new Error('--manifest=<path> is required');

type ManifestRecord = {
  mediaId: string;
  original: {
    storageKey: string;
    mimeType: string;
    sizeBytes: number;
    url: string;
    metadata: Prisma.JsonValue | null;
  };
  migrated: { storageKey: string };
  contents: Array<{ id: string; metadata: Prisma.JsonValue | null }>;
};
type Manifest = { version: number; records: ManifestRecord[] };

async function main() {
  const manifestPath = resolve(process.cwd(), manifestOption!);
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as Manifest;
  if (manifest.version !== 2 || !Array.isArray(manifest.records)) {
    throw new Error('Unsupported migration manifest');
  }

  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error('DATABASE_URL is required');
  }
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
  let restored = 0;
  let skipped = 0;
  try {
    for (const record of [...manifest.records].reverse()) {
      const media = await prisma.media.findUnique({
        where: { id: record.mediaId },
        select: { storageKey: true },
      });
      if (!media || media.storageKey !== record.migrated.storageKey) {
        console.warn(
          `[SKIP] ${record.mediaId}: current record no longer matches manifest`,
        );
        skipped += 1;
        continue;
      }

      console.log(`[${APPLY ? 'RESTORE' : 'DRY RUN'}] ${record.mediaId}`);
      if (!APPLY) continue;

      await prisma.$transaction(async (tx) => {
        await tx.media.update({
          where: { id: record.mediaId },
          data: {
            storageKey: record.original.storageKey,
            mimeType: record.original.mimeType,
            sizeBytes: record.original.sizeBytes,
            url: record.original.url,
            metadata:
              record.original.metadata === null
                ? Prisma.JsonNull
                : (record.original.metadata as Prisma.InputJsonValue),
          },
        });
        for (const content of record.contents) {
          await tx.content.update({
            where: { id: content.id },
            data: {
              metadata:
                content.metadata === null
                  ? Prisma.JsonNull
                  : (content.metadata as Prisma.InputJsonValue),
            },
          });
        }
      });
      restored += 1;
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log({ mode: APPLY ? 'apply' : 'dry-run', restored, skipped });
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
