/**
 * Safe, resumable migration for legacy image records.
 * Dry-run is the default. Pass --apply to create files and update the database.
 */

import 'dotenv/config';
import { ContentType, Prisma, PrismaClient } from '@prisma/client';
import { existsSync } from 'node:fs';
import { mkdir, rename, unlink, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import sharp from 'sharp';
import {
  imageContentHash,
  inspectImageFile,
  optimizedImageBaseKey,
  storedVariantsAreValid,
  StoredMigrationVariant,
  withMigratedContentImageUrl,
} from '../src/storage/image-migration';

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const EXPLICIT_DRY_RUN = args.includes('--dry-run');
if (APPLY && EXPLICIT_DRY_RUN) {
  throw new Error('Choose either --apply or --dry-run, not both');
}

function option(name: string) {
  return args
    .find((argument) => argument.startsWith(`--${name}=`))
    ?.split('=')[1];
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
const BREAKPOINTS_BY_PURPOSE: Record<string, readonly number[]> = {
  'store-hero': [400, 800, 1200, 1600],
  'store-cover': [400, 800, 1200, 1600],
  STORE_COVER: [400, 800, 1200, 1600],
  COVER_IMAGE: [400, 800, 1200, 1600],
  PARTNER_STORE_COVER: [400, 800, 1200, 1600],
  STORE_GALLERY: [400, 800, 1200],
  PARTNER_STORE_GALLERY: [400, 800, 1200],
  CAST_AVATAR: [200, 400, 800],
  CAST_PHOTO: [200, 400, 800],
  PARTNER_CAST_IMAGE: [200, 400, 800],
  TOUR_COVER: [400, 800, 1200],
  BLOG_COVER: [400, 800, 1200],
  BANNER_GLOBAL: [400, 800, 1200],
  STORE_MENU_ITEM: [200, 400, 800],
  PARTNER_MENU_ITEM: [200, 400, 800],
};
const DEFAULT_BREAKPOINTS = [400, 800, 1200] as const;

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

function getBreakpoints(purpose: string | null, originalWidth: number) {
  const configured =
    (purpose ? BREAKPOINTS_BY_PURPOSE[purpose] : undefined) ??
    DEFAULT_BREAKPOINTS;
  const widths = configured.filter((width) => width <= originalWidth);
  return widths.length ? [...widths] : [configured[0]];
}

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
  purpose: string | null,
) {
  const pipeline = sharp(sourcePath, { failOn: 'error' }).rotate();
  const source = await inspectImageFile(sourcePath);
  if (!source.width || !source.height) {
    throw new Error('Image dimensions are unavailable');
  }

  const variants: StoredMigrationVariant[] = [];
  const createdPaths: string[] = [];
  for (const width of getBreakpoints(purpose, source.width)) {
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
  const prisma = new PrismaClient();
  const manifest: MigrationManifest = {
    version: 2,
    startedAt: new Date().toISOString(),
    uploadDir: UPLOAD_DIR,
    records: [],
  };
  const where: Prisma.MediaWhereInput = {
    deletedAt: null,
    status: { not: 'DELETED' },
    type: 'IMAGE',
    mimeType: { in: PROCESSABLE_MIME_TYPES },
    ...(FILTER_PURPOSE ? { purpose: FILTER_PURPOSE } : {}),
    ...(FILTER_MEDIA_ID ? { id: FILTER_MEDIA_ID } : {}),
    ...(FILTER_CONTENT_TYPE
      ? { content: { is: { type: FILTER_CONTENT_TYPE } } }
      : {}),
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
        if (
          currentVariants.length &&
          (await storedVariantsAreValid(UPLOAD_DIR, currentVariants))
        ) {
          console.log(
            `[SKIP] ${record.storageKey}: valid variants already exist`,
          );
          skipped += 1;
          continue;
        }

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
        const contentHash = await imageContentHash(sourcePath);
        const baseKey = optimizedImageBaseKey(record.id, contentHash);
        console.log(
          `[${APPLY ? 'APPLY' : 'DRY RUN'}] ${record.storageKey}: actual=${source.format} ${source.width}x${source.height} -> ${baseKey}`,
        );
        if (!APPLY) {
          console.log(
            `  widths: ${getBreakpoints(record.purpose, source.width).join(', ')}`,
          );
          processed += 1;
          continue;
        }

        const createdPaths: string[] = [];
        try {
          const result = await processImage(
            sourcePath,
            baseKey,
            record.purpose,
          );
          createdPaths.push(...result.createdPaths);
          const accessSegment = record.access === 'PUBLIC' ? 'public' : 'files';
          const newUrl = `${PUBLIC_BASE_URL}/storage/${accessSegment}/${result.primary.webpKey}`;
          const nextMetadata = {
            ...metadata,
            variants: result.variants,
            originalWidth: result.source.width,
            originalHeight: result.source.height,
            migration: {
              version: 2,
              migratedAt: new Date().toISOString(),
              originalStorageKey: sourceStorageKey,
              originalUrl: record.url,
              detectedFormat: source.format,
              contentHash,
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
                storageKey: result.primary.webpKey,
                mimeType: 'image/webp',
                sizeBytes: result.primary.webpSizeBytes,
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
              storageKey: result.primary.webpKey,
              mimeType: 'image/webp',
              sizeBytes: result.primary.webpSizeBytes,
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
