/**
 * Safe, resumable migration for legacy image records.
 * Dry-run is the default. Pass --apply to create files and update the database.
 */

import 'dotenv/config';
import { ContentType, Prisma, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { existsSync } from 'node:fs';
import { mkdir, rename, unlink, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import sharp from 'sharp';
import {
  imageContentHash,
  inspectImageFile,
  optimizedImageBaseKey,
  referencedImageMediaIds,
  replaceStorageKeyInMediaUrl,
  storedVariantsAreValid,
  StoredMigrationVariant,
  withMigratedContentImageUrl,
} from '../src/storage/image-migration';
import {
  getImageBreakpoints,
  getMissingImageVariantWidths,
} from '../src/storage/image-breakpoints';

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const EXPLICIT_DRY_RUN = args.includes('--dry-run');
if (APPLY && EXPLICIT_DRY_RUN) {
  throw new Error('Choose either --apply or --dry-run, not both');
}

function option(name: string) {
  const inlineValue = args
    .find((argument) => argument.startsWith(`--${name}=`))
    ?.slice(name.length + 3);
  if (inlineValue) return inlineValue;

  const optionIndex = args.indexOf(`--${name}`);
  const followingValue = optionIndex >= 0 ? args[optionIndex + 1] : undefined;
  return followingValue && !followingValue.startsWith('--')
    ? followingValue
    : undefined;
}

function positiveIntegerOption(name: string, fallback: number) {
  const raw = option(name);
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`--${name} must be a positive integer`);
  }
  return value;
}

const BATCH_SIZE = positiveIntegerOption('batch', 20);
const LIMIT = option('limit') ? positiveIntegerOption('limit', 0) : 0;
const FILTER_PURPOSE = option('purpose');
const FILTER_MEDIA_ID = option('media-id');
const FILTER_CONTENT_TYPE = option('content-type')?.toUpperCase() as
  | ContentType
  | undefined;
if (
  FILTER_CONTENT_TYPE &&
  !Object.values(ContentType).includes(FILTER_CONTENT_TYPE)
) {
  throw new Error(`Unsupported --content-type: ${FILTER_CONTENT_TYPE}`);
}

const UPLOAD_DIR = resolve(
  process.cwd(),
  process.env.STORAGE_LOCAL_DIR ?? 'uploads',
);
const PUBLIC_BASE_URL =
  process.env.PUBLIC_BASE_URL ??
  `http://localhost:${process.env.PORT ?? '3001'}`;
const defaultManifestName = `image-migration-${new Date()
  .toISOString()
  .replace(/[:.]/g, '-')}.json`;
const MANIFEST_PATH = resolve(
  process.cwd(),
  option('manifest') ?? join('migration-logs', defaultManifestName),
);

const EXEMPT_PURPOSES = new Set([
  'bill-evidence',
  'APPEARANCE_LOGO',
  'APPEARANCE_ICON',
]);
const PROCESSABLE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
];
type JsonRecord = Record<string, unknown>;
type ManifestContent = { id: string; metadata: Prisma.JsonValue | null };
type ManifestRecord = {
  mediaId: string;
  original: {
    storageKey: string;
    mimeType: string;
    sizeBytes: number;
    url: string;
    metadata: Prisma.JsonValue | null;
  };
  migrated: {
    storageKey: string;
    mimeType: string;
    sizeBytes: number;
    url: string;
    metadata: Prisma.InputJsonValue;
  };
  contents: ManifestContent[];
  createdKeys: string[];
};
type MigrationManifest = {
  version: 2;
  startedAt: string;
  completedAt?: string;
  uploadDir: string;
  records: ManifestRecord[];
};

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

function storedVariants(metadata: unknown) {
  const variants = asRecord(metadata).variants;
  return Array.isArray(variants) ? (variants as StoredMigrationVariant[]) : [];
}

async function writeManifest(manifest: MigrationManifest) {
  await mkdir(dirname(MANIFEST_PATH), { recursive: true });
  const temporaryPath = `${MANIFEST_PATH}.tmp`;
  await writeFile(temporaryPath, JSON.stringify(manifest, null, 2), 'utf8');
  await rename(temporaryPath, MANIFEST_PATH);
}

async function processImage(
  sourcePath: string,
  baseKey: string,
  widths: readonly number[],
) {
  const pipeline = sharp(sourcePath, { failOn: 'error' }).rotate();
  const source = await inspectImageFile(sourcePath);
  if (!source.width || !source.height) {
    throw new Error('Image dimensions are unavailable');
  }

  const variants: StoredMigrationVariant[] = [];
  const createdPaths: string[] = [];
  for (const width of widths) {
    const resized = pipeline.clone().resize({
      width,
      withoutEnlargement: true,
      fit: 'inside',
    });
    const webpKey = `${baseKey}-${width}.webp`;
    const avifKey = `${baseKey}-${width}.avif`;
    const webpPath = join(UPLOAD_DIR, webpKey);
    const avifPath = join(UPLOAD_DIR, avifKey);
    const [webp, avif] = await Promise.all([
      resized
        .clone()
        .webp({ quality: 85, effort: 4, smartSubsample: true })
        .toFile(webpPath),
      resized
        .clone()
        .avif({ quality: 70, effort: 4, chromaSubsampling: '4:2:0' })
        .toFile(avifPath),
    ]);
    createdPaths.push(webpPath, avifPath);
    variants.push({
      width,
      webpKey,
      avifKey,
      webpSizeBytes: webp.size,
      avifSizeBytes: avif.size,
    });
  }

  if (!(await storedVariantsAreValid(UPLOAD_DIR, variants))) {
    throw new Error(
      'Generated variants failed signature or dimension validation',
    );
  }

  const primary =
    variants.find((variant) => variant.width === 800) ??
    variants[variants.length - 1];
  return {
    source,
    variants,
    primary,
    createdPaths,
  };
}

async function cleanupCreatedFiles(paths: string[]) {
  await Promise.all(paths.map((path) => unlink(path).catch(() => undefined)));
}

async function main() {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error('DATABASE_URL is required');
  }
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
  const manifest: MigrationManifest = {
    version: 2,
    startedAt: new Date().toISOString(),
    uploadDir: UPLOAD_DIR,
    records: [],
  };
  const contentMediaIds = FILTER_CONTENT_TYPE
    ? referencedImageMediaIds(
        await prisma.content.findMany({
          where: { type: FILTER_CONTENT_TYPE },
          select: { metadata: true },
        }),
      )
    : undefined;
  const idFilter: Prisma.MediaWhereInput['id'] = FILTER_MEDIA_ID
    ? contentMediaIds && !contentMediaIds.includes(FILTER_MEDIA_ID)
      ? { in: [] }
      : FILTER_MEDIA_ID
    : contentMediaIds
      ? { in: contentMediaIds }
      : undefined;
  const where: Prisma.MediaWhereInput = {
    deletedAt: null,
    status: { not: 'DELETED' },
    type: 'IMAGE',
    mimeType: { in: PROCESSABLE_MIME_TYPES },
    ...(FILTER_PURPOSE ? { purpose: FILTER_PURPOSE } : {}),
    ...(idFilter ? { id: idFilter } : {}),
  };

  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY RUN'}`);
  console.log(`Uploads: ${UPLOAD_DIR}`);
  if (APPLY) console.log(`Manifest: ${MANIFEST_PATH}`);

  let cursor: string | undefined;
  let processed = 0;
  let skipped = 0;
  let failed = 0;

  try {
    while (LIMIT === 0 || processed < LIMIT) {
      const batch = await prisma.media.findMany({
        where,
        orderBy: { id: 'asc' },
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        take: BATCH_SIZE,
        select: {
          id: true,
          contentId: true,
          storageKey: true,
          mimeType: true,
          sizeBytes: true,
          purpose: true,
          access: true,
          metadata: true,
          url: true,
        },
      });
      if (!batch.length) break;
      cursor = batch[batch.length - 1].id;

      for (const record of batch) {
        if (LIMIT > 0 && processed >= LIMIT) break;
        if (record.purpose && EXEMPT_PURPOSES.has(record.purpose)) {
          console.log(`[SKIP] ${record.storageKey}: exempt purpose`);
          skipped += 1;
          continue;
        }

        const metadata = asRecord(record.metadata);
        const currentVariants = storedVariants(metadata);
        const migration = asRecord(metadata.migration);
        const sourceStorageKey =
          typeof migration.originalStorageKey === 'string'
            ? migration.originalStorageKey
            : record.storageKey;
        const sourcePath = join(UPLOAD_DIR, sourceStorageKey);
        if (!existsSync(sourcePath)) {
          console.error(
            `[FAILED] ${record.storageKey}: source file is missing`,
          );
          failed += 1;
          continue;
        }

        const source = await inspectImageFile(sourcePath);
        const desiredWidths = getImageBreakpoints(record.purpose, source.width);
        const currentVariantsAreValid =
          currentVariants.length > 0 &&
          (await storedVariantsAreValid(UPLOAD_DIR, currentVariants));
        const missingWidths = currentVariantsAreValid
          ? getMissingImageVariantWidths(desiredWidths, currentVariants)
          : desiredWidths;
        if (currentVariantsAreValid && missingWidths.length === 0) {
          console.log(
            `[SKIP] ${record.storageKey}: all desired variants already exist`,
          );
          skipped += 1;
          continue;
        }

        const contentHash = await imageContentHash(sourcePath);
        const baseKey = optimizedImageBaseKey(record.id, contentHash);
        const operation = currentVariantsAreValid ? 'backfill' : 'migrate';
        console.log(
          `[${APPLY ? 'APPLY' : 'DRY RUN'}] ${record.storageKey}: ${operation} actual=${source.format} ${source.width}x${source.height} -> ${baseKey}`,
        );
        if (!APPLY) {
          console.log(`  widths: ${missingWidths.join(', ')}`);
          processed += 1;
          continue;
        }

        const createdPaths: string[] = [];
        try {
          const result = await processImage(sourcePath, baseKey, missingWidths);
          createdPaths.push(...result.createdPaths);
          const nextVariants = [
            ...(currentVariantsAreValid ? currentVariants : []),
            ...result.variants,
          ].sort((left, right) => left.width - right.width);
          if (!(await storedVariantsAreValid(UPLOAD_DIR, nextVariants))) {
            throw new Error('Combined variants failed validation');
          }
          const primary =
            nextVariants.find((variant) => variant.width === 800) ??
            nextVariants[nextVariants.length - 1];
          const keepCurrentPrimary = currentVariantsAreValid;
          const accessSegment = record.access === 'PUBLIC' ? 'public' : 'files';
          const newStorageKey = keepCurrentPrimary
            ? record.storageKey
            : primary.webpKey;
          const newUrl = keepCurrentPrimary
            ? record.url
            : (replaceStorageKeyInMediaUrl(record.url, primary.webpKey) ??
              `${PUBLIC_BASE_URL}/storage/${accessSegment}/${primary.webpKey}`);
          const migratedAt = new Date().toISOString();
          const nextMetadata = {
            ...metadata,
            variants: nextVariants,
            originalWidth: result.source.width,
            originalHeight: result.source.height,
            migration: {
              ...migration,
              version: 2,
              migratedAt:
                typeof migration.migratedAt === 'string'
                  ? migration.migratedAt
                  : migratedAt,
              originalStorageKey: sourceStorageKey,
              originalUrl:
                typeof migration.originalUrl === 'string'
                  ? migration.originalUrl
                  : record.url,
              detectedFormat: source.format,
              contentHash,
              ...(keepCurrentPrimary ? { backfilledAt: migratedAt } : {}),
            },
          } as Prisma.InputJsonObject;

          const previousContents = await prisma.$transaction(async (tx) => {
            const contents = await tx.content.findMany({
              where: {
                OR: [
                  ...(record.contentId ? [{ id: record.contentId }] : []),
                  {
                    metadata: {
                      path: ['imageMediaId'],
                      equals: record.id,
                    },
                  },
                ],
              },
              select: { id: true, metadata: true },
            });

            await tx.media.update({
              where: { id: record.id },
              data: {
                storageKey: newStorageKey,
                mimeType: keepCurrentPrimary ? record.mimeType : 'image/webp',
                sizeBytes: keepCurrentPrimary
                  ? record.sizeBytes
                  : primary.webpSizeBytes,
                url: newUrl,
                metadata: nextMetadata,
              },
            });
            for (const content of contents) {
              await tx.content.update({
                where: { id: content.id },
                data: {
                  metadata: withMigratedContentImageUrl(
                    content.metadata,
                    record.id,
                    newUrl,
                  ) as Prisma.InputJsonObject,
                },
              });
            }
            return contents;
          });

          manifest.records.push({
            mediaId: record.id,
            original: {
              storageKey: record.storageKey,
              mimeType: record.mimeType,
              sizeBytes: record.sizeBytes,
              url: record.url,
              metadata: record.metadata,
            },
            migrated: {
              storageKey: newStorageKey,
              mimeType: keepCurrentPrimary ? record.mimeType : 'image/webp',
              sizeBytes: keepCurrentPrimary
                ? record.sizeBytes
                : primary.webpSizeBytes,
              url: newUrl,
              metadata: nextMetadata,
            },
            contents: previousContents,
            createdKeys: result.variants.flatMap((variant) => [
              variant.webpKey,
              variant.avifKey,
            ]),
          });
          await writeManifest(manifest);
          processed += 1;
        } catch (error) {
          await cleanupCreatedFiles(createdPaths);
          console.error(
            `[FAILED] ${record.storageKey}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
          failed += 1;
        }
      }
      if (batch.length < BATCH_SIZE) break;
    }
  } finally {
    if (APPLY) {
      manifest.completedAt = new Date().toISOString();
      await writeManifest(manifest);
    }
    await prisma.$disconnect();
  }

  console.log({ processed, skipped, failed });
  if (failed) process.exitCode = 1;
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
