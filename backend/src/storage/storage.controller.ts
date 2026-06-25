import {
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
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import type * as express from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StorageService } from './storage.service';

type RequestWithUser = express.Request & {
  user: {
    id: string;
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
      },
      required: ['file'],
    },
  })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      dest: process.env.STORAGE_LOCAL_DIR ?? 'uploads',
    }),
  )
  @Post('upload')
  upload(
    @UploadedFile() file: LocalUploadedFile,
    @Req() request: RequestWithUser,
    @Body('purpose') purpose?: string,
  ) {
    return this.storageService.saveLocalFile(file, request.user.id, purpose);
  }

  @Get('files/:storageKey')
  async getFile(
    @Param('storageKey') storageKey: string,
    @Res() response: express.Response,
  ) {
    const { mediaFile, path } =
      await this.storageService.resolveLocalFile(storageKey);

    response.type(mediaFile.mimeType);
    return response.sendFile(path);
  }
}
