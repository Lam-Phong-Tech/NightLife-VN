import { Module } from '@nestjs/common';
import { AccessModule } from '../access/access.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { NightlifeDataController } from './nightlife-data.controller';
import { NightlifeDataService } from './nightlife-data.service';

@Module({
  imports: [AccessModule, NotificationsModule],
  controllers: [NightlifeDataController],
  providers: [NightlifeDataService],
})
export class NightlifeDataModule {}
