import { Injectable, Logger } from '@nestjs/common';
import { join } from 'node:path';
import { unlink } from 'node:fs/promises';
import sharp from 'sharp';
import { getImageBreakpoints } from './image-breakpoints';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ImageVariant = {
  width: number;
  webpKey: string;
  avifKey: string;
  webpSizeBytes: number;
  avifSizeBytes: number;
};

export type ProcessedImageResult = {
  /** The representative storage key to save in media.storageKey (800w WebP, or widest available) */
  primaryStorageKey: string;
  primaryMimeType: 'image/webp';
  /** sizeBytes of the primary variant */
  primarySizeBytes: number;
  variants: ImageVariant[];
  originalWidth: number;
  originalHeight: number;
  /** All physical file paths created — used for cleanup on error */
  createdPaths: string[];
};

// ---------------------------------------------------------------------------
// Purpose → breakpoint widths
// ---------------------------------------------------------------------------

/**
 * Purposes that must NOT be processed (preserve original file as-is).
 * Legal evidence, logos/icons, and SVGs should never be auto-converted.
 */
const EXEMPT_PURPOSES = new Set([
  'bill-evidence',
  'APPEARANCE_LOGO',
  'APPEARANCE_ICON',
]);

/**
 * MIME types that must NOT be processed regardless of purpose.
 */
const EXEMPT_MIME_TYPES = new Set([
  'image/svg+xml',
  'image/gif', // GIF animation would be lost
  'video/mp4',
  'video/webm',
  'video/youtube',
  'application/pdf',
]);

// ---------------------------------------------------------------------------
// Sharp encode options
// ---------------------------------------------------------------------------

const WEBP_OPTIONS: sharp.WebpOptions = {
  quality: 85,
  effort: 4,
  smartSubsample: true,
};

const AVIF_OPTIONS: sharp.AvifOptions = {
  quality: 70,
  effort: 4,
  chromaSubsampling: '4:2:0',
};

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class ImageProcessingService {
  private readonly logger = new Logger(ImageProcessingService.name);

  /**
   * Returns true if the uploaded file should go through image optimization.
   */
  shouldOptimize(purpose?: string, mimeType?: string): boolean {
    if (!purpose || !mimeType) return false;
    if (EXEMPT_PURPOSES.has(purpose)) return false;
    if (EXEMPT_MIME_TYPES.has(mimeType)) return false;
    // Only process raster images
    if (!mimeType.startsWith('image/')) return false;
    return true;
  }

  /**
   * Full image optimization pipeline:
   * 1. Read metadata (dimensions, orientation)
   * 2. Auto-rotate (EXIF orientation fix)
   * 3. For each breakpoint: resize → WebP + AVIF
   * 4. Return variant info + primary storageKey
   *
   * Throws on failure; caller must clean up `createdPaths` if needed.
   */
  async processImage(
    inputPath: string,
    baseStorageKey: string,
    uploadDir: string,
    purpose?: string,
  ): Promise<ProcessedImageResult> {
    const pipeline = sharp(inputPath, { failOn: 'error' }).rotate(); // auto-rotate from EXIF

    const metadata = await pipeline.metadata();
    const originalWidth = metadata.width ?? 0;
    const originalHeight = metadata.height ?? 0;

    const breakpoints = getImageBreakpoints(purpose, originalWidth);

    const createdPaths: string[] = [];
    const variants: ImageVariant[] = [];

    for (const width of breakpoints) {
      const resized = pipeline.clone().resize({
        width,
        withoutEnlargement: true, // never upscale
        fit: 'inside',
      });

      const webpKey = `${baseStorageKey}-${width}.webp`;
      const avifKey = `${baseStorageKey}-${width}.avif`;
      const webpPath = join(uploadDir, webpKey);
      const avifPath = join(uploadDir, avifKey);

      const [webpInfo, avifInfo] = await Promise.all([
        resized
          .clone()
          .webp(WEBP_OPTIONS)
          .toFile(webpPath)
          .then((info) => {
            createdPaths.push(webpPath);
            return info;
          }),
        resized
          .clone()
          .avif(AVIF_OPTIONS)
          .toFile(avifPath)
          .then((info) => {
            createdPaths.push(avifPath);
            return info;
          }),
      ]);

      variants.push({
        width,
        webpKey,
        avifKey,
        webpSizeBytes: webpInfo.size,
        avifSizeBytes: avifInfo.size,
      });

      this.logger.debug(
        `Processed ${baseStorageKey} @ ${width}w — WebP: ${webpInfo.size}B  AVIF: ${avifInfo.size}B`,
      );
    }

    // Pick primary: prefer 800w WebP, fallback to widest available
    const primary =
      variants.find((v) => v.width === 800) ?? variants[variants.length - 1];

    return {
      primaryStorageKey: primary.webpKey,
      primaryMimeType: 'image/webp',
      primarySizeBytes: primary.webpSizeBytes,
      variants,
      originalWidth,
      originalHeight,
      createdPaths,
    };
  }

  /**
   * Clean up physical files (call on error to avoid orphaned files on disk).
   */
  async cleanupFiles(paths: string[]): Promise<void> {
    await Promise.all(
      paths.map((p) =>
        unlink(p).catch((err: NodeJS.ErrnoException) => {
          if (err.code !== 'ENOENT') {
            this.logger.warn(`Failed to cleanup ${p}: ${err.message}`);
          }
        }),
      ),
    );
  }
}
