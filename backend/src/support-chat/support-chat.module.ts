import { Module } from '@nestjs/common';
import { SupportChatService } from './support-chat.service';
import { SupportChatGateway } from './support-chat.gateway';
import { SupportChatController } from './support-chat.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule, JwtModule],
  controllers: [SupportChatController],
  providers: [SupportChatService, SupportChatGateway],
  exports: [SupportChatService],
})
export class SupportChatModule {}
