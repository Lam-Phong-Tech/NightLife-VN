import { Module } from '@nestjs/common';
import { SupportChatService } from './support-chat.service';
import { SupportChatGateway } from './support-chat.gateway';
import { SupportChatController } from './support-chat.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
  controllers: [SupportChatController],
  providers: [SupportChatService, SupportChatGateway],
  exports: [SupportChatService],
})
export class SupportChatModule {}
