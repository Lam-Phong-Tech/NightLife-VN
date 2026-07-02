import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminNotificationService } from './admin-notification.service';
import { SocketGateway } from './socket.gateway';
import { LineService } from './line.service';
import { EmailNotificationService } from './email-notification.service';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [
    AdminNotificationService,
    SocketGateway,
    LineService,
    EmailNotificationService,
  ],
  exports: [
    AdminNotificationService,
    SocketGateway,
    LineService,
    EmailNotificationService,
  ],
})
export class NotificationsModule {}
