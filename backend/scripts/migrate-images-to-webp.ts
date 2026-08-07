/**
 * migrate-images-to-webp.ts
 *
 * Standalone migration script: processes existing image media records in the
 * database through the WebP/AVIF optimization pipeline.
 *
 * Usage:
 *   cd backend
 *   npx ts-node scripts/migrate-images-to-webp.ts [--dry-run] [--batch=50] [--purpose=STORE_COVER]
 *
 * Flags:
 *   --dry-run          Print what would be done without modifying anything
 *   --batch=N          Process N records per batch (default: 20)
 *   --purpose=X        Only process records with this purpose (optional)
 *   --limit=N          Stop after N records total (optional, for testing)
 *
 * Safety guarantees:
 *   - IDEMPOTENT: Skips records that already have metadata.variants
 *   - SAFE: If processing fails for one record, logs error and continues
 *   - REVERSIBLE: Original file is only deleted AFTER DB update succeeds
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import { join, dirname } from 'node:path';
import { existsSync } from 'node:fs';
import { unlink } from 'node:fs/promises';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const BATCH_SIZE = parseInt(args.find((a) => a.startsWith('--batch='))?.split('=')[1] ?? '20', 10);
const FILTER_PURPOSE = args.find((a) => a.startsWith('--purpose='))?.split('=')[1];
const LIMIT = parseInt(args.find((a) => a.startsWith('--limit='))?.split('=')[1] ?? '0', 10);

const UPLOAD_DIR = join(process.cwd(), process.env.STORAGE_LOCAL_DIR ?? 'uploads');
const PUBLIC_BASE_URL =
  process.env.PUBLIC_BASE_URL ??
  `http://localhost:${process.env.PORT ?? '3001'}`;

// ---------------------------------------------------------------------------
// Exempt purposes & MIME types (same logic as ImageProcessingService)
// ---------------------------------------------------------------------------

const EXEMPT_PURPOSES = new Set([
  'bill-evidence',
  'APPEARANCE_LOGO',
  'APPEARANCE_ICON',
]);

const PROCESSABLE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]);

// ---------------------------------------------------------------------------
// Breakpoints (same as ImageProcessingService)
// ---------------------------------------------------------------------------

const BREAKPOINTS_BY_PURPOSE: Record<string, readonly number[]> = {
  'store-hero':            [400, 800, 1200, 1600],
  'store-cover':           [400, 800, 1200, 1600],
  STORE_COVER:             [400, 800, 1200, 1600],
  COVER_IMAGE:             [400, 800, 1200, 1600],
  PARTNER_STORE_COVER:     [400, 800, 1200, 1600],
  STORE_GALLERY:           [400, 800, 1200],
  PARTNER_STORE_GALLERY:   [400, 800, 1200],
  CAST_AVATAR:             [200, 400, 800],
  CAST_PHOTO:              [200, 400, 800],
  PARTNER_CAST_IMAGE:      [200, 400, 800],
  TOUR_COVER:              [400, 800, 1200],
  BLOG_COVER:              [400, 800, 1200],
  BANNER_GLOBAL:           [400, 800, 1200],
  STORE_MENU_ITEM:         [200, 400, 800],
  PARTNER_MENU_ITEM:       [200, 400, 800],
};
const DEFAULT_BREAKPOINTS: readonly number[] = [400, 800, 1200];

function getBreakpoints(purpose?: string | null, originalWidth?: number): number[] {
  const configured: readonly number[] =
    (purpose ? BREAKPOINTS_BY_PURPOSE[purpose] : null) ?? DEFAULT_BREAKPOINTS;
  const effectiveWidth = originalWidth ?? Infinity;
  const filtered = configured.filter((w) => w <= effectiveWidth);
  return filtered.length > 0 ? [...filtered] : [configured[0] as number];
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ImageVariant = {
  width: number;
  webpKey: string;
  avifKey: string;
  webpSizeBytes: number;
  avifSizeBytes: number;
};

type ProcessResult = {
  primaryStorageKey: string;
  primaryMimeType: 'image/webp';
  primarySizeBytes: number;
  variants: ImageVariant[];
  originalWidth: number;
  originalHeight: number;
  createdPaths: string[];
};

// ---------------------------------------------------------------------------
// Image processing
// ---------------------------------------------------------------------------

async function processImageFile(
  inputPath: string,
  baseKey: string,
  purpose?: string | null,
): Promise<ProcessResult> {
  const pipeline = sharp(inputPath, { failOn: 'error' }).rotate();
  const meta = await pipeline.metadata();
  const originalWidth = meta.width ?? 0;
  const originalHeight = meta.height ?? 0;

  const breakpoints = getBreakpoints(purpose, originalWidth);
  const createdPaths: string[] = [];
  const variants: ImageVariant[] = [];

  for (const width of breakpoints) {
    const resized = pipeline.clone().resize({ width, withoutEnlargement: true, fit: 'inside' });

    const webpKey  = `${baseKey}-${width}.webp`;
    const avifKey  = `${baseKey}-${width}.avif`;
    const webpPath = join(UPLOAD_DIR, webpKey);
    const avifPath = join(UPLOAD_DIR, avifKey);

    const [webpInfo, avifInfo] = await Promise.all([
      resized.clone().webp({ quality: 85, effort: 4, smartSubsample: true }).toFile(webpPath).then((i) => { createdPaths.push(webpPath); return i; }),
      resized.clone().avif({ quality: 70, effort: 4, chromaSubsampling: '4:2:0' }).toFile(avifPath).then((i) => { createdPaths.push(avifPath); return i; }),
    ]);

    variants.push({ width, webpKey, avifKey, webpSizeBytes: webpInfo.size, avifSizeBytes: avifInfo.size });
    console.log(`  ↳ ${width}w → WebP: ${(webpInfo.size / 1024).toFixed(1)}KB  AVIF: ${(avifInfo.size / 1024).toFixed(1)}KB`);
  }

  const primary = variants.find((v) => v.width === 800) ?? variants[variants.length - 1];
  return {
    primaryStorageKey: primary.webpKey,
    primaryMimeType:   'image/webp',
    primarySizeBytes:  primary.webpSizeBytes,
    variants,
    originalWidth,
    originalHeight,
    createdPaths,
  };
}

async function cleanupFiles(paths: string[]) {
  for (const p of paths) {
    await unlink(p).catch(() => undefined);
  }
}

// ---------------------------------------------------------------------------
// Main migration
// ---------------------------------------------------------------------------

async function main() {
  const prisma = new PrismaClient();

  console.log('='.repeat(70));
  console.log('NightLife-VN — Image Migration to WebP/AVIF');
  console.log(`Mode:      ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE'}`);
  console.log(`Upload dir: ${UPLOAD_DIR}`);
  console.log(`Batch size: ${BATCH_SIZE}`);
  if (FILTER_PURPOSE) console.log(`Purpose filter: ${FILTER_PURPOSE}`);
  if (LIMIT) console.log(`Record limit: ${LIMIT}`);
  console.log('='.repeat(70));

  // Count eligible records first
  const whereClause = {
    deletedAt: null,
    status: { not: 'DELETED' as const },
    type: 'IMAGE' as const,
    mimeType: { in: [...PROCESSABLE_MIME_TYPES] },
    ...(FILTER_PURPOSE ? { purpose: FILTER_PURPOSE } : {}),
    // Skip records that already have variants in metadata
    // We can't filter on JSON field easily in Prisma without raw query,
    // so we filter in JS after fetch
  };

  const total = await prisma.media.count({ where: whereClause });
  console.log(`\nFound ${total} candidate records (before JSON filter)\n`);

  let processed = 0;
  let skipped = 0;
  let failed = 0;
  let offset = 0;

  while (true) {
    const batch = await prisma.media.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' },
      skip: offset,
      take: BATCH_SIZE,
      select: {
        id: true,
        storageKey: true,
        mimeType: true,
        sizeBytes: true,
        purpose: true,
        access: true,
        metadata: true,
        url: true,
      },
    });

    if (batch.length === 0) break;

    for (const record of batch) {
      // Skip if already processed (has variants in metadata)
      const meta = record.metadata as Record<string, unknown> | null;
      if (meta?.variants) {
        console.log(`[SKIP] ${record.storageKey} — already has variants`);
        skipped++;
        continue;
      }

      // Skip exempt purposes
      if (record.purpose && EXEMPT_PURPOSES.has(record.purpose)) {
        console.log(`[SKIP] ${record.storageKey} — exempt purpose: ${record.purpose}`);
        skipped++;
        continue;
      }

      const originalFilePath = join(UPLOAD_DIR, record.storageKey);

      // Skip if physical file doesn't exist
      if (!existsSync(originalFilePath)) {
        console.log(`[SKIP] ${record.storageKey} — file not found on disk`);
        skipped++;
        continue;
      }

      console.log(`\n[PROCESS] ${record.storageKey} (${record.mimeType}, purpose: ${record.purpose ?? 'none'})`);

      if (DRY_RUN) {
        const bp = getBreakpoints(record.purpose, undefined);
        console.log(`  → Would create ${bp.length * 2} variants at widths: ${bp.join(', ')}`);
        processed++;
        if (LIMIT > 0 && processed >= LIMIT) break;
        continue;
      }

      const createdPaths: string[] = [];
      try {
        // Base key = original storageKey (without extension) used as prefix for variants
        // E.g. "a1b2c3" → "a1b2c3-800.webp"
        const baseKey = record.storageKey.replace(/\.[^.]+$/, '');

        const result = await processImageFile(originalFilePath, baseKey, record.purpose);
        createdPaths.push(...result.createdPaths);

        // Build new URL
        const accessSegment = record.access === 'PUBLIC' ? 'public' : 'files';
        const newUrl = `${PUBLIC_BASE_URL}/storage/${accessSegment}/${result.primaryStorageKey}`;

        // Update DB record
        await prisma.media.update({
          where: { id: record.id },
          data: {
            storageKey: result.primaryStorageKey,
            mimeType:   result.primaryMimeType,
            sizeBytes:  result.primarySizeBytes,
            url:        newUrl,
            metadata: {
              variants:       result.variants,
              originalWidth:  result.originalWidth,
              originalHeight: result.originalHeight,
            },
          },
        });

        // Delete original file only after DB update succeeds
        await unlink(originalFilePath).catch((err: NodeJS.ErrnoException) => {
          if (err.code !== 'ENOENT') {
            console.warn(`  ⚠ Could not delete original: ${err.message}`);
          }
        });

        const originalKB = (record.sizeBytes / 1024).toFixed(1);
        const newKB = (result.primarySizeBytes / 1024).toFixed(1);
        const saving = (((record.sizeBytes - result.primarySizeBytes) / record.sizeBytes) * 100).toFixed(0);
        console.log(`  ✓ Done — ${originalKB}KB → ${newKB}KB (−${saving}%) → ${result.primaryStorageKey}`);
        processed++;
      } catch (err) {
        console.error(`  ✗ FAILED: ${err instanceof Error ? err.message : String(err)}`);
        // Clean up any partial files
        await cleanupFiles(createdPaths);
        failed++;
      }

      if (LIMIT > 0 && processed >= LIMIT) break;
    }

    if (LIMIT > 0 && processed >= LIMIT) {
      console.log(`\nReached limit of ${LIMIT} records.`);
      break;
    }

    offset += BATCH_SIZE;
    if (batch.length < BATCH_SIZE) break;
  }

  await prisma.$disconnect();

  console.log('\n' + '='.repeat(70));
  console.log('Migration complete');
  console.log(`  Processed : ${processed}`);
  console.log(`  Skipped   : ${skipped}`);
  console.log(`  Failed    : ${failed}`);
  console.log('='.repeat(70));

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
