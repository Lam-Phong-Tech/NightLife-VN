import {
  BadRequestException,
  ForbiddenException,
  PayloadTooLargeException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { MediaAccess, MediaType } from '@prisma/client';
import { AccessService } from '../access/access.service';
import { PrismaService } from '../prisma/prisma.service';
import { validateUploadedFile } from './upload-file-validation';

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

import { SystemConfigService } from '../system-config/system-config.service';

@Injectable()
export class StorageService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly accessService: AccessService,
    private readonly systemConfigService: SystemConfigService,
  ) {}

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

      const storageKey = file.filename;
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

      return await this.prisma.media.create({
        data: {
          ownerId: options.ownerId,
          storeId: relationIds.storeId,
          castId: relationIds.castId,
          bookingId: relationIds.bookingId,
          billId: relationIds.billId,
          contentId: relationIds.contentId,
          storageKey,
          originalName: validatedFile.originalName,
          mimeType: validatedFile.mimeType,
          sizeBytes: file.size,
          purpose: options.purpose?.trim(),
          type: this.resolveMediaType(validatedFile.mimeType),
          access,
          url: `${publicBaseUrl}/storage/${
            access === MediaAccess.PUBLIC ? 'public' : 'files'
          }/${storageKey}`,
        },
      });
    } catch (error) {
      await unlink(file.path).catch(() => undefined);
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

    return this.prisma.media.create({
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
      },
    });
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

    if (media.mimeType !== 'video/youtube') {
      await unlink(join(this.getUploadDir(), media.storageKey)).catch(
        (error: NodeJS.ErrnoException) => {
          if (error.code !== 'ENOENT') throw error;
        },
      );
    }

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

    if (mediaFile.ownerId !== user.id) {
      throw new ForbiddenException('You cannot access this media file');
    }

    return resolvedFile;
  }

  private async resolveLocalFile(storageKey: string) {
    const mediaFile = await this.prisma.media.findUnique({
      where: { storageKey },
      include: {
        booking: { select: { storeId: true } },
        bill: { select: { storeId: true } },
        cast: { select: { storeId: true } },
        content: { select: { storeId: true } },
      },
    });
    if (!mediaFile) {
      throw new NotFoundException('Media file not found');
    }
    if (mediaFile.deletedAt || mediaFile.status === 'DELETED') {
      throw new NotFoundException('Media file not found');
    }

    return {
      mediaFile,
      path: join(this.getUploadDir(), storageKey),
    };
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
