import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminNotificationService } from './admin-notification.service';
import { SocketGateway } from './socket.gateway';
import { LineService } from './line.service';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [AdminNotificationService, SocketGateway, LineService],
  exports: [AdminNotificationService, SocketGateway, LineService],
})
export class NotificationsModule {}
