import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';
import { NightlifeDataModule } from './nightlife-data/nightlife-data.module';
import { TelegramModule } from './telegram/telegram.module';
import { CategoriesModule } from './categories/categories.module';
import { SystemConfigModule } from './system-config/system-config.module';
import { SupportChatModule } from './support-chat/support-chat.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { TourModule } from './tour/tour.module';
import { validateEnv } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ScheduleModule.forRoot(),
    PrismaModule,
    UsersModule,
    AuthModule,
    StorageModule,
    NightlifeDataModule,
    TelegramModule,
    CategoriesModule,
    SystemConfigModule,
    SupportChatModule,
    AuditLogsModule,
    CampaignsModule,
    TourModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
