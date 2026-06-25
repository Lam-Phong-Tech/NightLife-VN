import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaService } from '../prisma/prisma.service';

type UploadedFile = {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
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
    ownerId: string,
    purpose?: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const storageKey = file.filename;
    const publicBaseUrl = this.configService.get<string>(
      'PUBLIC_BASE_URL',
      `http://localhost:${this.configService.get<string>('PORT', '3001')}`,
    );

    return this.prisma.media.create({
      data: {
        ownerId,
        storageKey,
        originalName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        purpose,
        url: `${publicBaseUrl}/storage/files/${storageKey}`,
      },
    });
  }

  async resolveLocalFile(storageKey: string) {
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
}
