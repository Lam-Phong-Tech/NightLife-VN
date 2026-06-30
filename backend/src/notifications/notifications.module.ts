import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminNotificationService } from './admin-notification.service';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [AdminNotificationService],
  exports: [AdminNotificationService],
})
export class NotificationsModule {}
