import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
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
    @Res() response: express.Response,
  ) {
    const { mediaFile, path } =
      await this.storageService.resolvePublicLocalFile(storageKey);

    // Cache-Control: 1 year immutable for public media assets
    response.set('Cache-Control', 'public, max-age=31536000, immutable');
    response.set('Vary', 'Accept');

    // Content negotiation: serve AVIF variant if browser supports it
    const servedPath = this.resolveVariantPath(path, mediaFile.storageKey, mediaFile.metadata, acceptHeader);
    const servedMime = servedPath !== path ? 'image/avif' : mediaFile.mimeType;

    response.type(servedMime);
    return response.sendFile(servedPath);
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
    const { mediaFile, path } =
      await this.storageService.resolveProtectedLocalFile(
        storageKey,
        request.user,
      );

    // Short cache for protected files (private, must revalidate)
    response.set('Cache-Control', 'private, max-age=300, must-revalidate');
    response.set('Vary', 'Accept');

    const servedPath = this.resolveVariantPath(path, mediaFile.storageKey, mediaFile.metadata, acceptHeader);
    const servedMime = servedPath !== path ? 'image/avif' : mediaFile.mimeType;

    response.type(servedMime);
    return response.sendFile(servedPath);
  }

  /**
   * If the browser accepts AVIF and a matching AVIF variant exists in metadata,
   * return the AVIF file path that corresponds to the requested storageKey.
   * Otherwise return the default path unchanged.
   *
   * Matching is done by webpKey so we always serve the SAME SIZE in AVIF
   * (not the largest or smallest available).
   */
  private resolveVariantPath(
    defaultPath: string,
    storageKey: string,
    metadata: unknown,
    acceptHeader?: string,
  ): string {
    if (!acceptHeader?.includes('image/avif')) return defaultPath;

    const meta = metadata as Record<string, unknown> | null;
    const variants = meta?.variants as
      | Array<{ webpKey: string; avifKey: string; width: number }>
      | undefined;
    if (!variants?.length) return defaultPath;

    // Find the variant whose webpKey matches the requested storageKey
    const matching = variants.find((v) => v.webpKey === storageKey);
    if (!matching?.avifKey) return defaultPath;

    return join(dirname(defaultPath), matching.avifKey);
  }
}
