import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramService } from './telegram.service';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const token = configService.get<string>('TELEGRAM_BOT_TOKEN')?.trim();

        return {
          token: token || '',
          launchOptions: token ? undefined : false,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
