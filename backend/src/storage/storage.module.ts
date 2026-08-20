import { Module } from '@nestjs/common';
import { AccessModule } from '../access/access.module';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { SystemConfigModule } from '../system-config/system-config.module';
import { ImageProcessingService } from './image-processing.service';
import { R2StorageService } from './r2-storage.service';
import { VideoThumbnailService } from './video-thumbnail.service';

@Module({
  imports: [AccessModule, SystemConfigModule],
  controllers: [StorageController],
  providers: [
    StorageService,
    ImageProcessingService,
    R2StorageService,
    VideoThumbnailService,
  ],
})
export class StorageModule {}
