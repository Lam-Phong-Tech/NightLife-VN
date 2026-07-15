import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LineService {
  private readonly logger = new Logger(LineService.name);
  private channelId: string;
  private channelSecret: string;

  constructor(private configService: ConfigService) {
    this.channelId = this.configService.get<string>('LINE_CHANNEL_ID') || '';
    this.channelSecret =
      this.configService.get<string>('LINE_CHANNEL_SECRET') || '';
  }

  async sendBookingConfirmation(guestPhoneOrId: string, bookingDetails: any) {
    if (!this.channelId || !this.channelSecret) {
      this.logger.warn(
        'LINE OA config is missing. Skipping fallback notification.',
      );
      return;
    }

    // In a real scenario, we would use @line/bot-sdk with a Channel Access Token
    // Here we simulate sending a message to the guest using their phone/ID
    this.logger.log(
      `[LINE MOCK] Sending confirmation to Guest ${guestPhoneOrId} for Booking ${bookingDetails.id}`,
    );
  }
}
