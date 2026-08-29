import { Module } from '@nestjs/common';
import { AccessModule } from '../access/access.module';
import { PasswordService } from '../common/password.service';
import { ContentTranslationService } from '../common/content-translation.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { TelegramModule } from '../telegram/telegram.module';
import { NightlifeDataController } from './nightlife-data.controller';
import { NightlifeDataService } from './nightlife-data.service';

@Module({
  imports: [AccessModule, NotificationsModule, TelegramModule],
  controllers: [NightlifeDataController],
  providers: [NightlifeDataService, PasswordService, ContentTranslationService],
})
export class NightlifeDataModule {}
