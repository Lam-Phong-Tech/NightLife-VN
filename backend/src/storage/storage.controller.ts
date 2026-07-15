import {
  BadRequestException,
  Body,
  Controller,
  Get,
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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MediaResponseDto } from './dto/storage-response.dto';
import { StorageService } from './storage.service';

const MAX_UPLOAD_SIZE_BYTES = 25 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'application/pdf',
]);

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
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
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
    if (!url) {
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

  @ApiOperation({ summary: 'Truy xuất file public' })
  @ApiOkResponse({ description: 'File binary stream' })
  @ApiProduces(
    'application/octet-stream',
    'image/jpeg',
    'image/png',
    'video/mp4',
  )
  @Get('public/:storageKey')
  async getPublicFile(
    @Param('storageKey') storageKey: string,
    @Res() response: express.Response,
  ) {
    const { mediaFile, path } =
      await this.storageService.resolvePublicLocalFile(storageKey);

    response.type(mediaFile.mimeType);
    return response.sendFile(path);
  }

  @ApiOperation({ summary: 'Truy xuất file có bảo vệ (cần token)' })
  @ApiOkResponse({ description: 'File binary stream' })
  @ApiProduces(
    'application/octet-stream',
    'image/jpeg',
    'image/png',
    'video/mp4',
  )
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('files/:storageKey')
  async getFile(
    @Param('storageKey') storageKey: string,
    @Req() request: RequestWithUser,
    @Res() response: express.Response,
  ) {
    const { mediaFile, path } =
      await this.storageService.resolveProtectedLocalFile(
        storageKey,
        request.user,
      );

    response.type(mediaFile.mimeType);
    return response.sendFile(path);
  }
}
