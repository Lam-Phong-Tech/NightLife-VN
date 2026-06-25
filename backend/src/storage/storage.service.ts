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
    const publicBaseUrl = this.configService.get<string>(
      'PUBLIC_BASE_URL',
      `http://localhost:${this.configService.get<string>('PORT', '3001')}`,
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

    if (
      mediaFile.access === MediaAccess.PROTECTED &&
      mediaFile.ownerId !== user.id &&
      !['ADMIN', 'PARTNER', 'STAFF'].includes(user.role ?? '')
    ) {
      throw new ForbiddenException('You cannot access this media file');
    }

    return resolvedFile;
  }

  private async resolveLocalFile(storageKey: string) {
    const mediaFile = await this.prisma.media.findUnique({
      where: { storageKey },
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
