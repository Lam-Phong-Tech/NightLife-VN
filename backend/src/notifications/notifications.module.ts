import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminNotificationService } from './admin-notification.service';
import { SocketGateway } from './socket.gateway';
import { LineService } from './line.service';
import { EmailNotificationService } from './email-notification.service';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
  ],
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
