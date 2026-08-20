import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import type * as express from 'express';
import { existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MediaResponseDto } from './dto/storage-response.dto';
import { StorageService } from './storage.service';
import { MAX_VIDEO_UPLOAD_SIZE_BYTES, uploadMimeTypes } from './upload-policy';

const MAX_UPLOAD_SIZE_BYTES = MAX_VIDEO_UPLOAD_SIZE_BYTES;
const ALLOWED_MIME_TYPES = new Set<string>(uploadMimeTypes);

type RequestWithUser = express.Request & {
  user: {
    id: string;
    role: string;
  };
};

type LocalUploadedFile = {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
};

type PublicImageVariant = {
  width: number;
  webpKey: string;
  avifKey?: string;
};

type RequestedImageFormat = 'auto' | 'webp' | 'avif';

export function parseRequestedImageWidth(value?: string): number | undefined {
  if (value === undefined || value === '') return undefined;

  const width = Number(value);
  if (!Number.isInteger(width) || width < 1 || width > 4096) {
    throw new BadRequestException(
      'width must be an integer between 1 and 4096',
    );
  }

  return width;
}

export function parseRequestedImageFormat(
  value?: string,
): RequestedImageFormat {
  const format = (value?.trim().toLowerCase() ||
    'auto') as RequestedImageFormat;
  if (!['auto', 'webp', 'avif'].includes(format)) {
    throw new BadRequestException('format must be auto, webp, or avif');
  }
  return format;
}

export function selectImageVariant(
  metadata: unknown,
  requestedWidth?: number,
): PublicImageVariant | undefined {
  const meta = metadata as Record<string, unknown> | null;
  const variants = Array.isArray(meta?.variants)
    ? (meta.variants as PublicImageVariant[])
        .filter(
          (variant) =>
            Number.isFinite(variant?.width) &&
            variant.width > 0 &&
            typeof variant.webpKey === 'string',
        )
        .sort((left, right) => left.width - right.width)
    : [];

  if (!variants.length) return undefined;
  if (requestedWidth === undefined) return undefined;

  return (
    variants.find((variant) => variant.width >= requestedWidth) ??
    variants[variants.length - 1]
  );
}

@ApiTags('storage')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @ApiOperation({ summary: 'Tải file lên server' })
  @ApiCreatedResponse({ type: MediaResponseDto })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        purpose: {
          type: 'string',
          example: 'venue-cover',
        },
        access: {
          type: 'string',
          enum: ['PUBLIC', 'PROTECTED'],
          example: 'PROTECTED',
        },
        storeId: {
          type: 'string',
          format: 'uuid',
        },
        castId: {
          type: 'string',
          format: 'uuid',
        },
        bookingId: {
          type: 'string',
          format: 'uuid',
        },
        billId: {
          type: 'string',
          format: 'uuid',
        },
        contentId: {
          type: 'string',
          format: 'uuid',
        },
      },
      required: ['file'],
    },
  })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      dest: process.env.STORAGE_LOCAL_DIR ?? 'uploads',
      limits: {
        fileSize: MAX_UPLOAD_SIZE_BYTES,
      },
      fileFilter: (_request, file, callback) => {
        const declaredMimeType = file.mimetype.trim().toLowerCase();
        if (
          declaredMimeType &&
          declaredMimeType !== 'application/octet-stream' &&
          !ALLOWED_MIME_TYPES.has(declaredMimeType)
        ) {
          callback(
            new BadRequestException(
              'Unsupported file type. Upload image, SVG, video, or PDF files only.',
            ),
            false,
          );
          return;
        }

        callback(null, true);
      },
    }),
  )
  @Post('upload')
  upload(
    @UploadedFile() file: LocalUploadedFile,
    @Req() request: RequestWithUser,
    @Body('purpose') purpose?: string,
    @Body('access') access?: 'PUBLIC' | 'PROTECTED',
    @Body('storeId') storeId?: string,
    @Body('castId') castId?: string,
    @Body('bookingId') bookingId?: string,
    @Body('billId') billId?: string,
    @Body('contentId') contentId?: string,
  ) {
    return this.storageService.saveLocalFile(file, {
      ownerId: request.user.id,
      userRole: request.user.role,
      purpose,
      access,
      storeId,
      castId,
      bookingId,
      billId,
      contentId,
    });
  }

  @ApiOperation({ summary: 'Lưu đường dẫn file từ bên ngoài (External URL)' })
  @ApiCreatedResponse({ type: MediaResponseDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('external')
  uploadExternal(
    @Req() request: RequestWithUser,
    @Body('url') url: string,
    @Body('purpose') purpose?: string,
    @Body('access') access?: 'PUBLIC' | 'PROTECTED',
    @Body('storeId') storeId?: string,
    @Body('castId') castId?: string,
    @Body('bookingId') bookingId?: string,
    @Body('billId') billId?: string,
    @Body('contentId') contentId?: string,
  ) {
    if (!url?.trim()) {
      throw new BadRequestException('URL is required');
    }
    return this.storageService.saveExternalUrl(url, {
      ownerId: request.user.id,
      userRole: request.user.role,
      purpose,
      access,
      storeId,
      castId,
      bookingId,
      billId,
      contentId,
    });
  }

  @ApiOperation({ summary: 'Xóa media đã tải lên và file vật lý tương ứng' })
  @ApiOkResponse({ description: 'Media đã được xóa' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('media/:mediaId')
  deleteMedia(
    @Param('mediaId') mediaId: string,
    @Req() request: RequestWithUser,
  ) {
    return this.storageService.deleteMedia(mediaId, request.user);
  }

  @ApiOperation({ summary: 'Truy xuất file public' })
  @ApiOkResponse({ description: 'File binary stream' })
  @ApiProduces(
    'application/octet-stream',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'video/mp4',
  )
  @Get('public/:storageKey')
  async getPublicFile(
    @Param('storageKey') storageKey: string,
    @Headers('accept') acceptHeader: string,
    @Query('width') widthQuery: string | undefined,
    @Query('format') formatQuery: string | undefined,
    @Res() response: express.Response,
  ) {
    const { mediaFile, path, storageKey: resolvedStorageKey, mimeType } =
      await this.storageService.resolvePublicLocalFile(storageKey);

    const requestedWidth = parseRequestedImageWidth(widthQuery);
    const requestedFormat = parseRequestedImageFormat(formatQuery);
    if (
      (requestedWidth !== undefined || formatQuery !== undefined) &&
      !mediaFile.mimeType.startsWith('image/')
    ) {
      throw new BadRequestException(
        'width and format are only supported for images',
      );
    }

    response.set('Cache-Control', 'public, max-age=31536000, immutable');
    if (requestedFormat === 'auto') response.set('Vary', 'Accept');

    if (this.storageService.isR2Enabled()) {
      const selected = this.resolveVariantKey({
        storageKey: resolvedStorageKey,
        metadata: mediaFile.metadata,
        acceptHeader,
        requestedWidth,
        requestedFormat,
        defaultMimeType: mimeType,
      });
      const object = await this.storageService.getR2Object(selected.storageKey);
      response.type(selected.mimeType);
      if (object.contentLength !== undefined) {
        response.set('Content-Length', String(object.contentLength));
      }
      return object.body.pipe(response);
    }

    const selected = this.resolveVariantPath({
      defaultPath: path,
      storageKey: resolvedStorageKey,
      metadata: mediaFile.metadata,
      acceptHeader,
      requestedWidth,
      requestedFormat,
      defaultMimeType: mimeType,
    });

    const fileStats = await stat(selected.path);
    response.type(selected.mimeType);
    response.set('Content-Length', String(fileStats.size));
    return response.sendFile(selected.path);
  }

  @ApiOperation({ summary: 'Truy xuất file có bảo vệ (cần token)' })
  @ApiOkResponse({ description: 'File binary stream' })
  @ApiProduces(
    'application/octet-stream',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'video/mp4',
  )
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('files/:storageKey')
  async getFile(
    @Param('storageKey') storageKey: string,
    @Headers('accept') acceptHeader: string,
    @Req() request: RequestWithUser,
    @Res() response: express.Response,
  ) {
    const { mediaFile, path, storageKey: resolvedStorageKey, mimeType } =
      await this.storageService.resolveProtectedLocalFile(
        storageKey,
        request.user,
      );

    // Short cache for protected files (private, must revalidate)
    response.set('Cache-Control', 'private, max-age=300, must-revalidate');
    response.set('Vary', 'Accept');

    if (this.storageService.isR2Enabled()) {
      const selected = this.resolveVariantKey({
        storageKey: resolvedStorageKey,
        metadata: mediaFile.metadata,
        acceptHeader,
        requestedFormat: 'auto',
        defaultMimeType: mimeType,
      });
      const object = await this.storageService.getR2Object(selected.storageKey);
      response.type(selected.mimeType);
      if (object.contentLength !== undefined) {
        response.set('Content-Length', String(object.contentLength));
      }
      return object.body.pipe(response);
    }

    const selected = this.resolveVariantPath({
      defaultPath: path,
      storageKey: resolvedStorageKey,
      metadata: mediaFile.metadata,
      acceptHeader,
      requestedFormat: 'auto',
      defaultMimeType: mimeType,
    });

    response.type(selected.mimeType);
    return response.sendFile(selected.path);
  }

  private resolveVariantKey(options: {
    storageKey: string;
    metadata: unknown;
    acceptHeader?: string;
    requestedWidth?: number;
    requestedFormat: RequestedImageFormat;
    defaultMimeType: string;
  }): { storageKey: string; mimeType: string } {
    const meta = options.metadata as Record<string, unknown> | null;
    const variants = Array.isArray(meta?.variants)
      ? (meta.variants as PublicImageVariant[])
      : [];
    const variant =
      selectImageVariant(options.metadata, options.requestedWidth) ??
      variants.find((item) => item.webpKey === options.storageKey);

    if (!variant) {
      if (
        (options.requestedFormat === 'avif' &&
          options.defaultMimeType !== 'image/avif') ||
        (options.requestedFormat === 'webp' &&
          options.defaultMimeType !== 'image/webp')
      ) {
        throw new NotFoundException('Requested image variant is not available');
      }
      return {
        storageKey: options.storageKey,
        mimeType: options.defaultMimeType,
      };
    }

    const wantsAvif =
      options.requestedFormat === 'avif' ||
      (options.requestedFormat === 'auto' &&
        options.acceptHeader?.includes('image/avif'));
    if (wantsAvif && variant.avifKey) {
      return { storageKey: variant.avifKey, mimeType: 'image/avif' };
    }
    if (options.requestedFormat === 'avif') {
      throw new NotFoundException(
        'AVIF variant is not available for this image',
      );
    }
    return { storageKey: variant.webpKey, mimeType: 'image/webp' };
  }

  /**
   * If the browser accepts AVIF and a matching AVIF variant exists in metadata,
   * return the AVIF file path that corresponds to the requested storageKey.
   * Otherwise return the default path unchanged.
   *
   * Matching is done by webpKey so we always serve the SAME SIZE in AVIF
   * (not the largest or smallest available).
   */
  private resolveVariantPath(options: {
    defaultPath: string;
    storageKey: string;
    metadata: unknown;
    acceptHeader?: string;
    requestedWidth?: number;
    requestedFormat: RequestedImageFormat;
    defaultMimeType: string;
  }): { path: string; mimeType: string } {
    const meta = options.metadata as Record<string, unknown> | null;
    const variants = Array.isArray(meta?.variants)
      ? (meta.variants as PublicImageVariant[])
      : [];
    const widthVariant = selectImageVariant(
      options.metadata,
      options.requestedWidth,
    );
    const primaryVariant = variants.find(
      (variant) => variant.webpKey === options.storageKey,
    );
    const variant = widthVariant ?? primaryVariant;

    if (!variant) {
      if (
        options.requestedFormat === 'avif' &&
        options.defaultMimeType !== 'image/avif'
      ) {
        throw new NotFoundException(
          'AVIF variant is not available for this image',
        );
      }
      if (
        options.requestedFormat === 'webp' &&
        options.defaultMimeType !== 'image/webp'
      ) {
        throw new NotFoundException(
          'WebP variant is not available for this image',
        );
      }
      return {
        path: options.defaultPath,
        mimeType: options.defaultMimeType,
      };
    }

    const wantsAvif =
      options.requestedFormat === 'avif' ||
      (options.requestedFormat === 'auto' &&
        options.acceptHeader?.includes('image/avif'));
    if (wantsAvif) {
      const avifPath = variant.avifKey
        ? join(dirname(options.defaultPath), variant.avifKey)
        : null;
      if (avifPath && existsSync(avifPath)) {
        return { path: avifPath, mimeType: 'image/avif' };
      }
      if (options.requestedFormat === 'avif') {
        throw new NotFoundException(
          'AVIF variant is not available for this image',
        );
      }
    }

    const webpPath = join(dirname(options.defaultPath), variant.webpKey);
    if (existsSync(webpPath)) {
      return { path: webpPath, mimeType: 'image/webp' };
    }

    if (
      options.requestedWidth !== undefined ||
      options.requestedFormat === 'webp'
    ) {
      throw new NotFoundException('Requested image variant is not available');
    }

    return { path: options.defaultPath, mimeType: options.defaultMimeType };
  }
}
