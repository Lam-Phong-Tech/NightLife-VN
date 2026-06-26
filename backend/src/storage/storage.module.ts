import { Module } from '@nestjs/common';
import { AccessModule } from '../access/access.module';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';

@Module({
  imports: [AccessModule],
  controllers: [StorageController],
  providers: [StorageService],
})
export class StorageModule {}
