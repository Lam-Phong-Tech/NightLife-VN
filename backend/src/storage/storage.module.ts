import { Module } from '@nestjs/common';
import { AccessModule } from '../access/access.module';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { SystemConfigModule } from '../system-config/system-config.module';

@Module({
  imports: [AccessModule, SystemConfigModule],
  controllers: [StorageController],
  providers: [StorageService],
})
export class StorageModule {}
