import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { MediaAccess, MediaType } from '@prisma/client';
import { AccessService } from '../access/access.service';
import { PrismaService } from '../prisma/prisma.service';

type UploadedFile = {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
};

type SaveLocalFileOptions = {
  ownerId: string;
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

@Injectable()
export class StorageService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly accessService: AccessService,
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

  async saveLocalFile(
    file: UploadedFile | undefined,
    options: SaveLocalFileOptions,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
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

    return this.prisma.media.create({
      data: {
        ownerId: options.ownerId,
        storeId: options.storeId,
        castId: options.castId,
        bookingId: options.bookingId,
        billId: options.billId,
        contentId: options.contentId,
        storageKey,
        originalName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        purpose: options.purpose,
        type: this.resolveMediaType(file.mimetype),
        access,
        url: `${publicBaseUrl}/storage/${
          access === MediaAccess.PUBLIC ? 'public' : 'files'
        }/${storageKey}`,
      },
    });
  }

  async saveExternalUrl(
    url: string,
    options: SaveLocalFileOptions,
  ) {
    const storageKey = `ext-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const access = this.resolveAccess(options.access);

    let mimeType = 'application/octet-stream';
    let type = MediaType.OTHER;
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      mimeType = 'video/youtube';
      type = MediaType.VIDEO;
    }

    return this.prisma.media.create({
      data: {
        ownerId: options.ownerId,
        storeId: options.storeId,
        castId: options.castId,
        bookingId: options.bookingId,
        billId: options.billId,
        contentId: options.contentId,
        storageKey,
        originalName: url,
        mimeType,
        sizeBytes: 0,
        purpose: options.purpose,
        type,
        access,
        url,
      },
    });
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
      ['ADMIN', 'OPERATOR', 'STAFF'].includes(user.role ?? '')
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
}
