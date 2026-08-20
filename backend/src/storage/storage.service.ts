import {
  BadRequestException,
  ForbiddenException,
  Logger,
  PayloadTooLargeException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync } from 'node:fs';
import { rename, unlink, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { MediaAccess, MediaType, Prisma } from '@prisma/client';
import { AccessService } from '../access/access.service';
import { PrismaService } from '../prisma/prisma.service';
import { SystemConfigService } from '../system-config/system-config.service';
import { validateUploadedFile } from './upload-file-validation';
import { ImageProcessingService } from './image-processing.service';
import { R2StorageService } from './r2-storage.service';
import { VideoThumbnailService } from './video-thumbnail.service';

type UploadedFile = {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
};

type SaveLocalFileOptions = {
  ownerId: string;
  userRole?: string;
  purpose?: string;
  access?: 'PUBLIC' | 'PROTECTED';
  storeId?: string;
  castId?: string;
  bookingId?: string;
  billId?: string;
  contentId?: string;
};

type StorageUser = {
  id: string;
  role?: string;
};

const GLOBAL_PUBLIC_UPLOAD_PURPOSES = new Set([
  'APPEARANCE_LOGO',
  'APPEARANCE_ICON',
  'BANNER_GLOBAL',
  'TOUR_COVER',
]);

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly accessService: AccessService,
    private readonly systemConfigService: SystemConfigService,
    private readonly imageProcessingService: ImageProcessingService,
    private readonly r2Storage: R2StorageService,
    private readonly videoThumbnailService: VideoThumbnailService,
  ) {}

  isR2Enabled() {
    return this.r2Storage.isEnabled();
  }

  getR2Object(storageKey: string) {
    return this.r2Storage.getObject(storageKey);
  }

  private storageKeys(primaryKey: string, metadata: unknown): string[] {
    const keys = new Set<string>([primaryKey]);
    const visit = (value: unknown, property?: string) => {
      if (typeof value === 'string' && property?.endsWith('Key'))
        keys.add(value);
      else if (Array.isArray(value)) value.forEach((item) => visit(item));
      else if (value && typeof value === 'object') {
        Object.entries(value as Record<string, unknown>).forEach(
          ([name, item]) => visit(item, name),
        );
      }
    };
    visit(metadata);
    return [...keys];
  }

  private async uploadToR2(
    keys: string[],
    mimeType: string,
    uploadDir: string,
  ) {
    if (!this.isR2Enabled()) return;
    await this.r2Storage.uploadFiles(
      keys.map((key) => ({
        key,
        path: join(uploadDir, key),
        contentType: key.endsWith('.avif')
          ? 'image/avif'
          : key.endsWith('.webp')
            ? 'image/webp'
            : mimeType,
      })),
    );
  }

  private async deleteFromR2(keys: string[]) {
    if (this.isR2Enabled()) await this.r2Storage.deleteObjects(keys);
  }

  private async deleteLocalStoredFiles(keys: string[], uploadDir: string) {
    if (!this.isR2Enabled()) return;
    await Promise.all(
      keys.map((key) =>
        unlink(join(uploadDir, key)).catch((error: NodeJS.ErrnoException) => {
          if (error.code !== 'ENOENT') throw error;
        }),
      ),
    );
  }

  onModuleInit() {
    const uploadDir = this.getUploadDir();
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
  }

  getUploadDir() {
    return join(
      process.cwd(),
      this.configService.get<string>('STORAGE_LOCAL_DIR', 'uploads'),
    );
  }

  async validateUploadPermissions(options: SaveLocalFileOptions) {
    if (!options.userRole) return;

    const access = this.resolveAccess(options.access);
    const storeId = this.cleanOptionalId(options.storeId);
    const castId = this.cleanOptionalId(options.castId);
    const bookingId = this.cleanOptionalId(options.bookingId);
    const billId = this.cleanOptionalId(options.billId);
    const contentId = this.cleanOptionalId(options.contentId);
    const hasScopedPublicTarget = Boolean(storeId || castId || contentId);
    const isGlobalPublicUpload =
      options.purpose !== undefined &&
      GLOBAL_PUBLIC_UPLOAD_PURPOSES.has(options.purpose);

    if (
      options.userRole === 'SUPER_ADMIN' ||
      options.userRole === 'ADMIN' ||
      options.userRole === 'OPERATOR'
    ) {
      if (
        access === MediaAccess.PUBLIC &&
        !hasScopedPublicTarget &&
        !isGlobalPublicUpload
      ) {
        throw new ForbiddenException(
          'Public uploads must be linked to a store, cast, content, or allowed global purpose.',
        );
      }
      return;
    }

    if (options.userRole === 'USER') {
      if (access !== MediaAccess.PROTECTED || storeId || castId || contentId) {
        throw new ForbiddenException(
          'Users are only allowed to upload protected bill evidence.',
        );
      }

      if (!billId && !bookingId) {
        throw new ForbiddenException(
          'Protected user uploads must be linked to a bill or booking.',
        );
      }

      if (billId) {
        const bill = await this.prisma.bill.findFirst({
          where: { id: billId, deletedAt: null },
          select: { userId: true, submittedByUserId: true },
        });
        if (
          !bill ||
          (bill.userId !== options.ownerId &&
            bill.submittedByUserId !== options.ownerId)
        ) {
          throw new ForbiddenException(
            'You do not have permission to upload for this bill.',
          );
        }
      }

      if (bookingId) {
        const booking = await this.prisma.booking.findFirst({
          where: { id: bookingId, deletedAt: null },
          select: { userId: true },
        });
        if (!booking || booking.userId !== options.ownerId) {
          throw new ForbiddenException(
            'You do not have permission to upload for this booking.',
          );
        }
      }
      return;
    }

    if (options.userRole === 'PARTNER') {
      const user = { id: options.ownerId, role: options.userRole };

      if (access === MediaAccess.PUBLIC && !hasScopedPublicTarget) {
        throw new ForbiddenException(
          'Partner public uploads must be linked to a store, cast, or content.',
        );
      }

      if (storeId) {
        await this.accessService.ensureStoreAccess(user, storeId);
      }

      if (castId) {
        const cast = await this.prisma.cast.findUnique({
          where: { id: castId },
          select: { storeId: true },
        });
        if (!cast) {
          throw new ForbiddenException(
            'You do not have permission to upload for this cast.',
          );
        }
        await this.accessService.ensureStoreAccess(user, cast.storeId);
      }

      if (contentId) {
        const content = await this.prisma.content.findFirst({
          where: { id: contentId, deletedAt: null },
          select: { storeId: true },
        });
        if (!content?.storeId) {
          throw new ForbiddenException(
            'You do not have permission to upload for this content.',
          );
        }
        await this.accessService.ensureStoreAccess(user, content.storeId);
      }
      return;
    }

    if (access === MediaAccess.PUBLIC || storeId || castId || contentId) {
      throw new ForbiddenException('Upload permission denied.');
    }
  }

  async saveLocalFile(
    file: UploadedFile | undefined,
    options: SaveLocalFileOptions,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Tracks all extra files created during image processing for cleanup on error
    const processingCreatedPaths: string[] = [];
    let uploadedR2Keys: string[] = [];

    try {
      await this.validateUploadPermissions(options);

      let validatedFile: Awaited<ReturnType<typeof validateUploadedFile>>;
      try {
        validatedFile = await validateUploadedFile(file, options.purpose);
      } catch (error) {
        throw new BadRequestException(
          error instanceof Error ? error.message : 'File tải lên không hợp lệ.',
        );
      }

      const usage = await this.systemConfigService.getStorageUsage();
      if (
        usage.limit > 0 &&
        usage.usedBytes + file.size > usage.limit * 1024 * 1024 * 1024
      ) {
        throw new PayloadTooLargeException(
          `Dung lượng lưu trữ của hệ thống đã đạt giới hạn (${usage.limit}GB). Vui lòng nâng cấp gói để tiếp tục.`,
        );
      }

      const purpose = options.purpose?.trim();
      const uploadDir = this.getUploadDir();

      // -----------------------------------------------------------------------
      // Image optimization pipeline (WebP + AVIF variants)
      // -----------------------------------------------------------------------
      let storageKey = file.filename;
      let finalMimeType: string = validatedFile.mimeType;
      let finalSizeBytes = file.size;
      let mediaMetadata: Record<string, unknown> | null = null;
      let videoThumbnailKey: string | null = null;

      // Multer's generated filename has no extension. Keep the validated
      // extension on uploaded videos so clients can reliably identify and
      // render them after the upload response is saved in a listing draft.
      if (validatedFile.mimeType.startsWith('video/')) {
        const extension = extname(validatedFile.originalName).toLowerCase();
        if (extension && !file.filename.toLowerCase().endsWith(extension)) {
          storageKey = `${file.filename}${extension}`;
          const storagePath = join(uploadDir, storageKey);
          await rename(file.path, storagePath);
          file.filename = storageKey;
          file.path = storagePath;
        }

        try {
          const thumbnail = await this.videoThumbnailService.create(
            file.path,
            storageKey,
            uploadDir,
          );
          processingCreatedPaths.push(thumbnail.path);
          videoThumbnailKey = thumbnail.storageKey;
        } catch (error) {
          this.logger.warn(
            `Could not generate a thumbnail for video ${storageKey}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }

      if (
        this.imageProcessingService.shouldOptimize(
          purpose,
          validatedFile.mimeType,
        )
      ) {
        try {
          const processed = await this.imageProcessingService.processImage(
            file.path,
            file.filename,
            uploadDir,
            purpose,
          );

          processingCreatedPaths.push(...processed.createdPaths);

          // Swap the storage key and metadata to use the optimized primary variant
          storageKey = processed.primaryStorageKey;
          finalMimeType = processed.primaryMimeType;
          finalSizeBytes = processed.primarySizeBytes;
          mediaMetadata = {
            variants: processed.variants,
            originalWidth: processed.originalWidth,
            originalHeight: processed.originalHeight,
          };

          // Delete the raw original upload — no longer needed
          await unlink(file.path).catch((err: NodeJS.ErrnoException) => {
            if (err.code !== 'ENOENT') {
              this.logger.warn(
                `Could not delete original upload ${file.path}: ${err.message}`,
              );
            }
          });
        } catch (error) {
          this.logger.error(
            `Image processing failed for ${file.filename}: ${
              error instanceof Error ? error.message : String(error)
            }. Falling back to original file.`,
          );
          // On processing failure fall back to original file — do not block upload
        }
      }

      // -----------------------------------------------------------------------
      // Build URLs and media record
      // -----------------------------------------------------------------------
      const webBaseUrl = this.configService.get<string>('WEB_BASE_URL');
      const defaultPublicBase = webBaseUrl
        ? `${webBaseUrl}/api/backend`
        : `http://localhost:${this.configService.get<string>('PORT', '3001')}`;
      const publicBaseUrl = this.configService.get<string>(
        'PUBLIC_BASE_URL',
        defaultPublicBase,
      );
      const access = this.resolveAccess(options.access);
      const relationIds = this.cleanRelationIds(options);
      if (videoThumbnailKey) {
        mediaMetadata = {
          ...(mediaMetadata ?? {}),
          thumbnailKey: videoThumbnailKey,
          thumbnailUrl: `${publicBaseUrl}/storage/${
            access === MediaAccess.PUBLIC ? 'public' : 'files'
          }/${videoThumbnailKey}`,
          thumbnailMimeType: 'image/webp',
        };
      }
      const mediaData = {
        ownerId: options.ownerId,
        storeId: relationIds.storeId,
        castId: relationIds.castId,
        bookingId: relationIds.bookingId,
        billId: relationIds.billId,
        contentId: relationIds.contentId,
        storageKey,
        originalName: validatedFile.originalName,
        mimeType: finalMimeType,
        sizeBytes: finalSizeBytes,
        purpose,
        type: this.resolveMediaType(finalMimeType),
        access,
        metadata:
          mediaMetadata !== null
            ? (mediaMetadata as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        url: `${publicBaseUrl}/storage/${
          access === MediaAccess.PUBLIC ? 'public' : 'files'
        }/${storageKey}`,
      };

      uploadedR2Keys = this.storageKeys(storageKey, mediaMetadata);
      await this.uploadToR2(uploadedR2Keys, finalMimeType, uploadDir);

      const shouldReplaceBillEvidence = Boolean(
        options.userRole === 'USER' &&
        relationIds.billId &&
        purpose === 'bill-evidence',
      );

      if (!shouldReplaceBillEvidence) {
        const createdMedia = await this.prisma.media.create({
          data: mediaData,
        });
        await this.deleteLocalStoredFiles(uploadedR2Keys, uploadDir);
        return createdMedia;
      }

      const replacement = await this.prisma.$transaction(async (tx) => {
        const previousMedia = await tx.media.findMany({
          where: {
            billId: relationIds.billId,
            purpose: 'bill-evidence',
            deletedAt: null,
            status: { not: 'DELETED' },
          },
          select: {
            id: true,
            storageKey: true,
            mimeType: true,
            metadata: true,
          },
        });
        const createdMedia = await tx.media.create({ data: mediaData });

        if (previousMedia.length) {
          await tx.media.updateMany({
            where: { id: { in: previousMedia.map((media) => media.id) } },
            data: {
              status: 'DELETED',
              deletedAt: new Date(),
            },
          });
        }

        return { createdMedia, previousMedia };
      });

      await Promise.all(
        replacement.previousMedia.map(async (media) => {
          if (media.mimeType === 'video/youtube') return;
          // Delete all variant files stored in metadata (if any)
          const meta = media.metadata as Record<string, unknown> | null;
          const variants = meta?.variants as
            | Array<{ webpKey: string; avifKey: string }>
            | undefined;
          if (variants?.length) {
            await this.deleteVariantFiles(variants, uploadDir);
          }
          // Delete the primary file itself
          await this.deleteFromR2(
            this.storageKeys(media.storageKey, media.metadata),
          );
          try {
            await unlink(join(uploadDir, media.storageKey));
          } catch (error) {
            const fileError = error as NodeJS.ErrnoException;
            if (fileError.code !== 'ENOENT') {
              this.logger.warn(
                `Could not delete replaced bill evidence ${media.storageKey}: ${fileError.message}`,
              );
            }
          }
        }),
      );

      await this.deleteLocalStoredFiles(uploadedR2Keys, uploadDir);
      return replacement.createdMedia;
    } catch (error) {
      // Clean up the original upload file
      await unlink(file.path).catch(() => undefined);
      // Clean up any variant files created before the error
      await this.imageProcessingService.cleanupFiles(processingCreatedPaths);
      await this.deleteFromR2(uploadedR2Keys).catch(() => undefined);
      throw error;
    }
  }

  async saveExternalUrl(url: string, options: SaveLocalFileOptions) {
    const externalVideo = this.normalizeYoutubeUrl(url, options.purpose);
    const storageKey = `ext-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const access = this.resolveAccess(options.access);

    await this.validateUploadPermissions(options);

    // Check storage quota
    const usage = await this.systemConfigService.getStorageUsage();
    if (usage.limit > 0 && usage.usedBytes > usage.limit * 1024 * 1024 * 1024) {
      throw new PayloadTooLargeException(
        `Dung lượng lưu trữ của hệ thống đã đạt giới hạn (${usage.limit}GB). Vui lòng nâng cấp gói để tiếp tục.`,
      );
    }

    const relationIds = this.cleanRelationIds(options);

    // -----------------------------------------------------------------------
    // Auto-fetch & cache YouTube thumbnail (non-blocking — errors are logged)
    // -----------------------------------------------------------------------
    let thumbnailMeta: Prisma.InputJsonObject | null = null;
    try {
      thumbnailMeta = await this.fetchAndCacheYoutubeThumbnail(
        externalVideo.videoId,
        storageKey,
      );
      this.logger.log(
        `Thumbnail cached for YouTube ${externalVideo.videoId}: ${JSON.stringify((thumbnailMeta as Record<string, unknown>).primaryKey)}`,
      );
    } catch (err) {
      this.logger.warn(
        `Could not cache thumbnail for YouTube ${externalVideo.videoId}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }

    const thumbnailPrimaryKey =
      thumbnailMeta && typeof thumbnailMeta.primaryKey === 'string'
        ? thumbnailMeta.primaryKey
        : storageKey;
    const thumbnailKeys = thumbnailMeta
      ? this.storageKeys(thumbnailPrimaryKey, thumbnailMeta)
      : [];
    await this.uploadToR2(thumbnailKeys, 'image/webp', this.getUploadDir());

    const createdExternalMedia = await this.prisma.media.create({
      data: {
        ownerId: options.ownerId,
        storeId: relationIds.storeId,
        castId: relationIds.castId,
        bookingId: relationIds.bookingId,
        billId: relationIds.billId,
        contentId: relationIds.contentId,
        storageKey,
        originalName: `YouTube ${externalVideo.videoId}`,
        mimeType: 'video/youtube',
        sizeBytes: 0,
        purpose: options.purpose?.trim(),
        type: MediaType.VIDEO,
        access,
        url: externalVideo.url,
        metadata:
          thumbnailMeta !== null
            ? (thumbnailMeta as Prisma.InputJsonValue)
            : Prisma.JsonNull,
      },
    });
    await this.deleteLocalStoredFiles(thumbnailKeys, this.getUploadDir());
    return createdExternalMedia;
  }

  async deleteMedia(mediaId: string, user: StorageUser) {
    const normalizedMediaId = mediaId.trim();
    if (!normalizedMediaId) {
      throw new BadRequestException('mediaId is required');
    }

    const media = await this.prisma.media.findUnique({
      where: { id: normalizedMediaId },
      select: {
        id: true,
        ownerId: true,
        storeId: true,
        castId: true,
        contentId: true,
        bookingId: true,
        billId: true,
        storageKey: true,
        mimeType: true,
        metadata: true,
        deletedAt: true,
        cast: { select: { storeId: true } },
        content: { select: { storeId: true } },
        booking: { select: { storeId: true } },
        bill: { select: { storeId: true } },
      },
    });
    if (!media || media.deletedAt) {
      throw new NotFoundException('Media file not found');
    }

    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'].includes(
      user.role ?? '',
    );
    if (!isAdmin && media.ownerId !== user.id) {
      if (user.role !== 'PARTNER') {
        throw new ForbiddenException('You cannot delete this media file');
      }
      const relatedStoreId =
        media.storeId ??
        media.cast?.storeId ??
        media.content?.storeId ??
        media.booking?.storeId ??
        media.bill?.storeId;
      if (!relatedStoreId) {
        throw new ForbiddenException('You cannot delete this media file');
      }
      await this.accessService.ensureStoreAccess(user, relatedStoreId);
    }

    await this.prisma.media.update({
      where: { id: media.id },
      data: {
        status: 'DELETED',
        deletedAt: new Date(),
      },
    });

    if (media.mimeType === 'video/youtube') {
      // For YouTube videos: clean up cached thumbnail variant files if any
      const meta = media.metadata as Record<string, unknown> | null;
      const thumbnail = meta?.thumbnail as Record<string, unknown> | undefined;
      const thumbVariants = thumbnail?.variants as
        | Array<{ webpKey: string; avifKey: string }>
        | undefined;
      if (thumbVariants?.length) {
        await this.deleteVariantFiles(thumbVariants, this.getUploadDir());
      }
    } else {
      const uploadDir = this.getUploadDir();

      // Delete variant files (WebP + AVIF) if they exist in metadata
      const meta = media.metadata as Record<string, unknown> | null;
      const variants = meta?.variants as
        | Array<{ webpKey: string; avifKey: string }>
        | undefined;
      if (variants?.length) {
        await this.deleteVariantFiles(variants, uploadDir);
      }

      // Delete the primary file
      await unlink(join(uploadDir, media.storageKey)).catch(
        (error: NodeJS.ErrnoException) => {
          if (error.code !== 'ENOENT') throw error;
        },
      );
    }

    await this.deleteFromR2(this.storageKeys(media.storageKey, media.metadata));
    return { id: media.id, deleted: true };
  }

  async resolvePublicLocalFile(storageKey: string) {
    const resolvedFile = await this.resolveLocalFile(storageKey);

    if (resolvedFile.mediaFile.access !== MediaAccess.PUBLIC) {
      throw new NotFoundException('Media file not found');
    }

    return resolvedFile;
  }

  async resolveProtectedLocalFile(storageKey: string, user: StorageUser) {
    const resolvedFile = await this.resolveLocalFile(storageKey);
    const mediaFile = resolvedFile.mediaFile;

    if (mediaFile.access !== MediaAccess.PROTECTED) {
      return resolvedFile;
    }

    if (
      mediaFile.ownerId === user.id ||
      ['SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'STAFF'].includes(user.role ?? '')
    ) {
      return resolvedFile;
    }

    if (user.role === 'PARTNER') {
      const relatedStoreId =
        mediaFile.storeId ??
        mediaFile.booking?.storeId ??
        mediaFile.bill?.storeId ??
        mediaFile.cast?.storeId ??
        mediaFile.content?.storeId;

      if (relatedStoreId) {
        await this.accessService.ensureStoreAccess(user, relatedStoreId);
        return resolvedFile;
      }
    }

    // Allow a member (USER) to view protected evidence of their own bill,
    // even if the file was uploaded by a partner or operator.
    if (user.role === 'USER' && mediaFile.bill) {
      const bill = mediaFile.bill;
      if (bill.userId === user.id || bill.submittedByUserId === user.id) {
        return resolvedFile;
      }
    }

    if (mediaFile.ownerId !== user.id) {
      throw new ForbiddenException('You cannot access this media file');
    }

    return resolvedFile;
  }

  private async resolveLocalFile(storageKey: string) {
    const include = {
      booking: { select: { storeId: true } },
      bill: {
        select: { storeId: true, userId: true, submittedByUserId: true },
      },
      cast: { select: { storeId: true } },
      content: { select: { storeId: true } },
    };
    let mediaFile = await this.prisma.media.findUnique({
      where: { storageKey },
      include,
    });

    // Video thumbnails are companion R2 objects, not standalone Media rows.
    // Resolve them through their parent video's metadata so their public URLs
    // can be served just like optimized image variants.
    const isVideoThumbnail = !mediaFile;
    if (!mediaFile) {
      mediaFile = await this.prisma.media.findFirst({
        where: {
          metadata: {
            path: ['thumbnailKey'],
            equals: storageKey,
          },
        },
        include,
      });
    }
    if (!mediaFile) {
      throw new NotFoundException('Media file not found');
    }
    if (mediaFile.deletedAt || mediaFile.status === 'DELETED') {
      throw new NotFoundException('Media file not found');
    }

    return {
      mediaFile,
      path: join(this.getUploadDir(), storageKey),
      storageKey,
      mimeType:
        isVideoThumbnail &&
        typeof (mediaFile.metadata as Record<string, unknown> | null)
          ?.thumbnailMimeType === 'string'
          ? ((mediaFile.metadata as Record<string, unknown>).thumbnailMimeType as string)
          : mediaFile.mimeType,
    };
  }

  /**
   * Download the best available YouTube thumbnail, process it through the
   * image optimization pipeline, and return thumbnail metadata for storage.
   *
   * Priority: maxresdefault (1280×720) → hqdefault (480×360) → mqdefault (320×180)
   * Output stored in metadata.thumbnail: { primaryKey, variants, originalWidth, originalHeight }
   */
  private async fetchAndCacheYoutubeThumbnail(
    videoId: string,
    baseStorageKey: string,
  ): Promise<Prisma.InputJsonObject> {
    const candidateUrls = [
      `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    ];

    let imageBuffer: Buffer | null = null;
    for (const thumbUrl of candidateUrls) {
      try {
        const res = await fetch(thumbUrl, {
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok && res.headers.get('content-type')?.startsWith('image/')) {
          imageBuffer = Buffer.from(await res.arrayBuffer());
          this.logger.debug(`YouTube thumbnail fetched from ${thumbUrl}`);
          break;
        }
      } catch {
        // try next candidate
      }
    }

    if (!imageBuffer) {
      throw new Error(`No thumbnail available for YouTube videoId ${videoId}`);
    }

    const uploadDir = this.getUploadDir();
    const tempPath = join(uploadDir, `${baseStorageKey}-thumb-src.jpg`);
    await writeFile(tempPath, imageBuffer);

    try {
      const processed = await this.imageProcessingService.processImage(
        tempPath,
        `${baseStorageKey}-thumb`,
        uploadDir,
        'STORE_GALLERY', // 400, 800, 1200 breakpoints — suitable for a 16:9 thumbnail
      );

      return {
        primaryKey: processed.primaryStorageKey,
        variants: processed.variants as Prisma.InputJsonValue,
        originalWidth: processed.originalWidth,
        originalHeight: processed.originalHeight,
      };
    } finally {
      // Always delete the downloaded source JPEG regardless of success/failure
      await unlink(tempPath).catch(() => undefined);
    }
  }

  private async deleteVariantFiles(
    variants: Array<{ webpKey: string; avifKey: string }>,
    uploadDir: string,
  ): Promise<void> {
    await Promise.all(
      variants.flatMap((v) => [
        unlink(join(uploadDir, v.webpKey)).catch(
          (err: NodeJS.ErrnoException) => {
            if (err.code !== 'ENOENT') {
              this.logger.warn(
                `Could not delete variant ${v.webpKey}: ${err.message}`,
              );
            }
          },
        ),
        unlink(join(uploadDir, v.avifKey)).catch(
          (err: NodeJS.ErrnoException) => {
            if (err.code !== 'ENOENT') {
              this.logger.warn(
                `Could not delete variant ${v.avifKey}: ${err.message}`,
              );
            }
          },
        ),
      ]),
    );
  }

  private resolveMediaType(mimeType: string) {
    if (mimeType.startsWith('image/')) {
      return MediaType.IMAGE;
    }

    if (mimeType.startsWith('video/')) {
      return MediaType.VIDEO;
    }

    if (mimeType === 'application/pdf') {
      return MediaType.DOCUMENT;
    }

    return MediaType.OTHER;
  }

  private resolveAccess(access?: string) {
    if (!access) {
      return MediaAccess.PROTECTED;
    }

    if (access === MediaAccess.PUBLIC || access === MediaAccess.PROTECTED) {
      return access;
    }

    throw new BadRequestException('access must be PUBLIC or PROTECTED');
  }

  private cleanOptionalId(value?: string) {
    return value?.trim() || undefined;
  }

  private cleanRelationIds(options: SaveLocalFileOptions) {
    return {
      storeId: this.cleanOptionalId(options.storeId),
      castId: this.cleanOptionalId(options.castId),
      bookingId: this.cleanOptionalId(options.bookingId),
      billId: this.cleanOptionalId(options.billId),
      contentId: this.cleanOptionalId(options.contentId),
    };
  }

  private normalizeYoutubeUrl(url: string, purpose?: string) {
    const normalizedPurpose = purpose?.trim();
    if (
      !['STORE_VIDEO', 'PARTNER_STORE_VIDEO'].includes(normalizedPurpose ?? '')
    ) {
      throw new BadRequestException(
        'External URL is only supported for store YouTube videos.',
      );
    }

    const trimmedUrl = url.trim();
    let parsed: URL;
    try {
      parsed = new URL(trimmedUrl);
    } catch {
      throw new BadRequestException('YouTube URL is invalid');
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new BadRequestException('YouTube URL must use HTTP or HTTPS');
    }

    const host = parsed.hostname.replace(/^www\./i, '').toLowerCase();
    let videoId = '';
    if (host === 'youtu.be') {
      videoId = parsed.pathname.split('/').filter(Boolean)[0] ?? '';
    } else if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
      videoId =
        parsed.searchParams.get('v') ??
        parsed.pathname.match(/\/(?:embed|shorts|live)\/([^/?#]+)/)?.[1] ??
        '';
    }

    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      throw new BadRequestException(
        'YouTube URL must contain a valid video id',
      );
    }

    return {
      videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
    };
  }
}
