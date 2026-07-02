import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

export type BookingQrEmailInput = {
  to: string;
  guestName?: string | null;
  bookingId: string;
  bookingCode: string;
  status: string;
  storeName?: string | null;
  storeSlug?: string | null;
  castName?: string | null;
  scheduledAt?: Date | string | null;
  partySize?: number | null;
  amountLabel?: string | null;
  note?: string | null;
  qrPayload: string;
  qrImageUrl: string;
  qrImageDataUrl?: string | null;
};

export type EmailDeliveryResult = {
  messageId?: string | null;
};

@Injectable()
export class EmailNotificationService {
  constructor(private readonly configService: ConfigService) {}

  async sendBookingQrEmail(
    input: BookingQrEmailInput,
  ): Promise<EmailDeliveryResult> {
    const host = this.configValue('SMTP_HOST');
    const from = this.mailFrom();

    if (!host || !from) {
      throw new Error('SMTP_HOST and MAIL_FROM are required to send email');
    }

    const secure = this.smtpSecure();
    const port = this.smtpPort(secure);
    const user = this.configValue('SMTP_USER');
    const pass = this.configValue('SMTP_PASS');
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user ? { user, pass } : undefined,
    });
    const qrAttachment = this.qrAttachment(input);
    const message = await transporter.sendMail({
      from,
      to: input.to,
      subject: `NightLife - ${input.bookingCode} đơn đặt bàn thành công`,
      text: this.bookingEmailText(input),
      html: this.bookingEmailHtml(input, Boolean(qrAttachment)),
      attachments: qrAttachment ? [qrAttachment] : undefined,
    });

    return { messageId: message.messageId ?? null };
  }

  private bookingEmailText(input: BookingQrEmailInput) {
    return [
      `Xin chào ${input.guestName || 'quý khách'},`,
      '',
      'NightLife xác nhận đơn đặt bàn của bạn đã thành công.',
      '',
      `Mã đặt bàn: ${input.bookingCode}`,
      `Quán: ${input.storeName || 'NightLife'}`,
      input.castName ? `Cast: ${input.castName}` : null,
      `Thời gian: ${this.formatDateTime(input.scheduledAt)}`,
      `Số người: ${input.partySize ?? 'Chưa cập nhật'}`,
      `Chi phí: ${input.amountLabel || 'Miễn phí - không thu cọc'}`,
      `Trạng thái: ${this.statusLabel(input.status)}`,
      input.note ? `Ghi chú: ${input.note}` : null,
      '',
      'Mã QR đặt bàn đã được đính kèm trong email này.',
      `QR dự phòng: ${input.qrImageUrl}`,
      '',
      'Vui lòng đưa mã QR cho nhân viên quán khi tới nơi.',
    ]
      .filter((line): line is string => line !== null)
      .join('\n');
  }

  private bookingEmailHtml(
    input: BookingQrEmailInput,
    hasQrAttachment: boolean,
  ) {
    const qrSrc = hasQrAttachment ? 'cid:booking-qr' : input.qrImageUrl;
    const rows = [
      ['Mã đặt bàn', input.bookingCode],
      ['Quán', input.storeName || 'NightLife'],
      input.castName ? ['Cast', input.castName] : null,
      ['Thời gian', this.formatDateTime(input.scheduledAt)],
      ['Số người', String(input.partySize ?? 'Chưa cập nhật')],
      ['Chi phí', input.amountLabel || 'Miễn phí - không thu cọc'],
      ['Trạng thái', this.statusLabel(input.status)],
      input.note ? ['Ghi chú', input.note] : null,
    ].filter((row): row is [string, string] => Array.isArray(row));

    return `<!doctype html>
<html>
  <body style="margin:0;background:#08080b;color:#f8f4e8;font-family:Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:28px 18px;">
      <h1 style="margin:0 0 8px;color:#f5d982;font-size:26px;">Vietyoru</h1>
      <p style="margin:0 0 22px;color:#b8b1a1;letter-spacing:3px;font-size:11px;">VIETNAM NIGHTLIFE GUIDE</p>
      <div style="border:1px solid rgba(245,217,130,.28);border-radius:14px;background:#141417;padding:22px;">
        <h2 style="margin:0 0 12px;font-size:22px;color:#fff;">Thông tin hóa đơn đặt bàn</h2>
        <p style="margin:0 0 20px;color:#cfc7b6;line-height:1.55;">
          Xin chào ${this.escapeHtml(input.guestName || 'quý khách')}, đơn đặt bàn của bạn đã thành công.
        </p>
        <table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          ${rows
            .map(
              ([label, value]) => `<tr>
            <td style="padding:9px 0;color:#9f9687;font-size:13px;border-bottom:1px solid rgba(255,255,255,.08);">${this.escapeHtml(label)}</td>
            <td style="padding:9px 0;color:#fff;font-size:14px;font-weight:700;text-align:right;border-bottom:1px solid rgba(255,255,255,.08);">${this.escapeHtml(value)}</td>
          </tr>`,
            )
            .join('')}
        </table>
        <div style="text-align:center;margin:22px 0;">
          <img src="${this.escapeAttribute(qrSrc)}" alt="QR đặt bàn ${this.escapeAttribute(input.bookingCode)}" width="220" height="220" style="display:inline-block;border-radius:12px;background:#fff;padding:10px;" />
          <p style="margin:12px 0 0;color:#b8b1a1;font-size:13px;">Đưa mã này cho nhân viên quán khi tới nơi.</p>
        </div>
        <p style="margin:18px 0 0;color:#8d8577;font-size:12px;line-height:1.5;">
          Không thanh toán online, không thu cọc. Admin sẽ liên hệ xác nhận chỗ nếu cần.
        </p>
      </div>
    </div>
  </body>
</html>`;
  }

  private qrAttachment(input: BookingQrEmailInput) {
    const match = input.qrImageDataUrl?.match(/^data:image\/png;base64,(.+)$/);

    if (!match?.[1]) {
      return null;
    }

    return {
      filename: `${input.bookingCode.toLowerCase()}-qr.png`,
      content: Buffer.from(match[1], 'base64'),
      contentType: 'image/png',
      cid: 'booking-qr',
    };
  }

  private formatDateTime(value?: Date | string | null) {
    if (!value) {
      return 'Chưa cập nhật';
    }

    const date = value instanceof Date ? value : new Date(value);
    if (!Number.isFinite(date.getTime())) {
      return String(value);
    }

    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: this.configValue('EMAIL_TIME_ZONE') || 'Asia/Bangkok',
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour12: false,
    }).format(date);
  }

  private statusLabel(status: string) {
    if (status === 'CONFIRMED') {
      return 'Đã xác nhận';
    }
    if (status === 'CANCELLED') {
      return 'Đã hủy';
    }
    if (status === 'COMPLETED' || status === 'CHECKED_IN') {
      return 'Hoàn tất';
    }
    return 'Đang chờ xác nhận';
  }

  private mailFrom() {
    const from = this.configValue('MAIL_FROM') || this.configValue('SMTP_FROM');
    const name = this.configValue('MAIL_FROM_NAME') || 'Vietyoru';

    if (!from || from.includes('<')) {
      return from;
    }

    return `"${this.headerText(name)}" <${from}>`;
  }

  private smtpPort(secure: boolean) {
    const configuredPort = Number(this.configValue('SMTP_PORT'));
    if (Number.isInteger(configuredPort) && configuredPort > 0) {
      return configuredPort;
    }

    return secure ? 465 : 587;
  }

  private smtpSecure() {
    const value = this.configValue('SMTP_SECURE').toLowerCase();
    return value === 'true' || value === '1' || value === 'yes';
  }

  private configValue(key: string) {
    return this.configService.get<string>(key)?.trim() ?? '';
  }

  private headerText(value: string) {
    return value.replace(/[\r\n"]/g, ' ').trim();
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private escapeAttribute(value: string) {
    return this.escapeHtml(value);
  }
}
