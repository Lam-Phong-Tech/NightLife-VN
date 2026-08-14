import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

export type StoredMigrationVariant = {
  width: number;
  webpKey: string;
  avifKey: string;
  webpSizeBytes: number;
  avifSizeBytes: number;
};

export async function inspectImageFile(filePath: string) {
  const metadata = await sharp(filePath, { failOn: 'error' }).metadata();
  return {
    format: metadata.format ?? 'unknown',
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
  };
}

export async function imageContentHash(filePath: string) {
  const file = await readFile(filePath);
  return createHash('sha256').update(file).digest('hex').slice(0, 12);
}

export function optimizedImageBaseKey(mediaId: string, contentHash: string) {
  const safeMediaId = mediaId.replace(/[^a-zA-Z0-9-]/g, '');
  const safeHash = contentHash.replace(/[^a-fA-F0-9]/g, '').slice(0, 12);
  if (!safeMediaId || !safeHash) {
    throw new Error(
      'Cannot create an optimized image key without media id and content hash',
    );
  }
  return `${safeMediaId}-opt-${safeHash}`;
}

export async function storedVariantsAreValid(
  uploadDir: string,
  variants: StoredMigrationVariant[],
) {
  if (!variants.length) return false;

  for (const variant of variants) {
    const webpPath = join(uploadDir, variant.webpKey);
    const avifPath = join(uploadDir, variant.avifKey);
    if (!existsSync(webpPath) || !existsSync(avifPath)) return false;

    const [webp, avif] = await Promise.all([
      inspectImageFile(webpPath),
      inspectImageFile(avifPath),
    ]);
    if (webp.format !== 'webp' || avif.format !== 'heif') return false;
    if (webp.width !== variant.width || avif.width !== variant.width)
      return false;
  }

  return true;
}

export function withMigratedContentImageUrl(
  metadata: unknown,
  mediaId: string,
  newUrl: string,
) {
  const current =
    metadata && typeof metadata === 'object' && !Array.isArray(metadata)
      ? (metadata as Record<string, unknown>)
      : {};
  if (current.imageMediaId !== mediaId) return current;
  return { ...current, imageUrl: newUrl };
}
