import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

export type BookingQrEmailInput = {
  to: string;
  locale?: EmailLocale | string | null;
  guestName?: string | null;
  bookingId: string;
  bookingCode: string;
  status: string;
  storeName?: string | null;
  storeSlug?: string | null;
  castName?: string | null;
  scheduledAt?: Date | string | null;
  partySize?: number | null;
  amountVnd?: number | null;
  amountLabel?: string | null;
  note?: string | null;
  qrPayload: string;
  qrImageUrl: string;
  qrImageDataUrl?: string | null;
};

export type EmailDeliveryResult = {
  messageId?: string | null;
};

export type PasswordResetEmailInput = {
  to: string;
  displayName?: string | null;
  code: string;
  expiresAt: Date;
};

export type RegistrationOtpEmailInput = {
  to: string;
  code: string;
  expiresAt: Date;
};

type EmailLocale = 'vi' | 'en' | 'ja' | 'ko' | 'zh';

type BookingEmailTemplate = {
  htmlLang: string;
  intlLocale: string;
  subject: (bookingCode: string) => string;
  guestFallback: string;
  title: string;
  intro: (guestName: string) => string;
  labels: {
    bookingCode: string;
    store: string;
    cast: string;
    scheduledAt: string;
    partySize: string;
    amount: string;
    paymentMethod: string;
    deliveryInfo: string;
    status: string;
    note: string;
  };
  defaults: {
    store: string;
    scheduledAt: string;
    partySize: string;
    amount: string;
    paymentMethod: string;
    deliveryInfo: string;
  };
  statusLabels: Record<string, string>;
  ctaLabel: string;
  qrAlt: (bookingCode: string) => string;
  qrHint: string;
  footerNote: string;
  textQrAttached: string;
  textQrBackup: string;
  textArrival: string;
};

const defaultEmailLocale: EmailLocale = 'ja';

const bookingEmailTemplates: Record<EmailLocale, BookingEmailTemplate> = {
  vi: {
    htmlLang: 'vi',
    intlLocale: 'vi-VN',
    subject: (bookingCode) => `Vietyoru - Xác nhận đặt chỗ ${bookingCode}`,
    guestFallback: 'quý khách',
    title: 'Thông tin đặt chỗ',
    intro: (guestName) =>
      `Xin chào ${guestName}, Vietyoru đã ghi nhận yêu cầu đặt chỗ của bạn.`,
    labels: {
      bookingCode: 'Mã đặt chỗ',
      store: 'Địa điểm',
      cast: 'Cast',
      scheduledAt: 'Thời gian',
      partySize: 'Số khách',
      amount: 'Chi phí',
      paymentMethod: 'Phương thức thanh toán',
      deliveryInfo: 'Thông tin nhận mã',
      status: 'Trạng thái',
      note: 'Ghi chú',
    },
    defaults: {
      store: 'Vietyoru',
      scheduledAt: 'Chưa cập nhật',
      partySize: 'Chưa cập nhật',
      amount: 'Miễn phí đặt chỗ, không thu cọc',
      paymentMethod: 'Thanh toán trực tiếp tại địa điểm',
      deliveryInfo: 'Mã QR được gửi kèm trong email này',
    },
    statusLabels: {
      CONFIRMED: 'Đã xác nhận',
      CANCELLED: 'Đã hủy',
      COMPLETED: 'Hoàn tất',
      CHECKED_IN: 'Đã check-in',
      NO_SHOW: 'Không đến',
      REQUESTED: 'Đang chờ xác nhận',
    },
    ctaLabel: 'Mở mã QR dự phòng',
    qrAlt: (bookingCode) => `QR đặt chỗ ${bookingCode}`,
    qrHint: 'Vui lòng đưa mã này cho nhân viên khi tới nơi.',
    footerNote:
      'Không thanh toán online, không thu cọc. Đội ngũ hỗ trợ có thể liên hệ để xác nhận chỗ nếu cần.',
    textQrAttached: 'Mã QR đặt chỗ đã được đính kèm trong email này.',
    textQrBackup: 'QR dự phòng',
    textArrival: 'Vui lòng đưa mã QR cho nhân viên khi tới nơi.',
  },
  en: {
    htmlLang: 'en',
    intlLocale: 'en-US',
    subject: (bookingCode) =>
      `Vietyoru - Reservation confirmation ${bookingCode}`,
    guestFallback: 'Guest',
    title: 'Reservation details',
    intro: (guestName) =>
      `Hello ${guestName}, thank you for your reservation with Vietyoru.`,
    labels: {
      bookingCode: 'Reservation code',
      store: 'Venue',
      cast: 'Cast',
      scheduledAt: 'Date and time',
      partySize: 'Guests',
      amount: 'Amount',
      paymentMethod: 'Payment method',
      deliveryInfo: 'Delivery information',
      status: 'Status',
      note: 'Note',
    },
    defaults: {
      store: 'Vietyoru',
      scheduledAt: 'Not updated',
      partySize: 'Not updated',
      amount: 'Free reservation, no deposit required',
      paymentMethod: 'Pay directly at the venue',
      deliveryInfo: 'Your QR code is attached to this email',
    },
    statusLabels: {
      CONFIRMED: 'Confirmed',
      CANCELLED: 'Cancelled',
      COMPLETED: 'Completed',
      CHECKED_IN: 'Checked in',
      NO_SHOW: 'No-show',
      REQUESTED: 'Pending confirmation',
    },
    ctaLabel: 'Open backup QR code',
    qrAlt: (bookingCode) => `Reservation QR ${bookingCode}`,
    qrHint: 'Please show this code to the venue staff when you arrive.',
    footerNote:
      'No online payment or deposit is required. Our support team may contact you if the venue needs confirmation.',
    textQrAttached: 'Your reservation QR code is attached to this email.',
    textQrBackup: 'Backup QR',
    textArrival: 'Please show the QR code to the venue staff when you arrive.',
  },
  ja: {
    htmlLang: 'ja',
    intlLocale: 'ja-JP',
    subject: (bookingCode) => `Vietyoru - ご予約確認 ${bookingCode}`,
    guestFallback: 'お客様',
    title: 'ご予約内容',
    intro: (guestName) =>
      `${guestName}、ご予約いただき、誠にありがとうございます。以下の内容でご予約を承りました。`,
    labels: {
      bookingCode: '予約番号',
      store: '店舗',
      cast: 'キャスト',
      scheduledAt: 'ご来店日時',
      partySize: '人数',
      amount: '料金',
      paymentMethod: 'お支払い方法',
      deliveryInfo: 'QRコードのご案内',
      status: '予約状況',
      note: 'ご要望',
    },
    defaults: {
      store: 'Vietyoru',
      scheduledAt: '未定',
      partySize: '未定',
      amount: '予約無料、事前決済なし',
      paymentMethod: 'ご来店時に店舗でお支払いください',
      deliveryInfo: 'QRコードは本メールに添付されています',
    },
    statusLabels: {
      CONFIRMED: '確定済み',
      CANCELLED: 'キャンセル済み',
      COMPLETED: '完了',
      CHECKED_IN: 'チェックイン済み',
      NO_SHOW: '来店なし',
      REQUESTED: '確認待ち',
    },
    ctaLabel: '予備QRコードを開く',
    qrAlt: (bookingCode) => `予約QRコード ${bookingCode}`,
    qrHint: 'ご来店時に、こちらのQRコードを店舗スタッフへご提示ください。',
    footerNote:
      'オンライン決済および事前決済は不要です。必要に応じて、サポート担当より確認のご連絡を差し上げる場合がございます。',
    textQrAttached: '予約用QRコードを本メールに添付しております。',
    textQrBackup: '予備QRコード',
    textArrival: 'ご来店時にQRコードを店舗スタッフへご提示ください。',
  },
  ko: {
    htmlLang: 'ko',
    intlLocale: 'ko-KR',
    subject: (bookingCode) => `Vietyoru - 예약 확인 ${bookingCode}`,
    guestFallback: '고객님',
    title: '예약 정보',
    intro: (guestName) =>
      `${guestName}, Vietyoru를 통해 예약해 주셔서 감사합니다. 아래 내용으로 예약 요청이 접수되었습니다.`,
    labels: {
      bookingCode: '예약 코드',
      store: '장소',
      cast: 'Cast',
      scheduledAt: '방문 일시',
      partySize: '인원',
      amount: '금액',
      paymentMethod: '결제 방법',
      deliveryInfo: '수령 정보',
      status: '상태',
      note: '요청 사항',
    },
    defaults: {
      store: 'Vietyoru',
      scheduledAt: '미정',
      partySize: '미정',
      amount: '예약 무료, 보증금 없음',
      paymentMethod: '현장에서 직접 결제',
      deliveryInfo: 'QR 코드가 이 이메일에 첨부되어 있습니다',
    },
    statusLabels: {
      CONFIRMED: '확정됨',
      CANCELLED: '취소됨',
      COMPLETED: '완료',
      CHECKED_IN: '체크인 완료',
      NO_SHOW: '노쇼',
      REQUESTED: '확인 대기',
    },
    ctaLabel: '예비 QR 코드 열기',
    qrAlt: (bookingCode) => `예약 QR ${bookingCode}`,
    qrHint: '방문 시 직원에게 이 QR 코드를 보여 주세요.',
    footerNote:
      '온라인 결제와 보증금은 필요하지 않습니다. 필요한 경우 지원팀에서 확인 연락을 드릴 수 있습니다.',
    textQrAttached: '예약 QR 코드가 이 이메일에 첨부되어 있습니다.',
    textQrBackup: '예비 QR',
    textArrival: '방문 시 직원에게 QR 코드를 보여 주세요.',
  },
  zh: {
    htmlLang: 'zh-CN',
    intlLocale: 'zh-CN',
    subject: (bookingCode) => `Vietyoru - 预约确认 ${bookingCode}`,
    guestFallback: '贵宾',
    title: '预约信息',
    intro: (guestName) =>
      `${guestName}，感谢您通过 Vietyoru 预约。您的预约请求已成功提交，详情如下。`,
    labels: {
      bookingCode: '预约编号',
      store: '店铺',
      cast: 'Cast',
      scheduledAt: '到店时间',
      partySize: '人数',
      amount: '费用',
      paymentMethod: '支付方式',
      deliveryInfo: '接收信息',
      status: '预约状态',
      note: '备注',
    },
    defaults: {
      store: 'Vietyoru',
      scheduledAt: '暂未更新',
      partySize: '暂未更新',
      amount: '免费预约，无需预付订金',
      paymentMethod: '到店后直接支付',
      deliveryInfo: '二维码已随本邮件发送',
    },
    statusLabels: {
      CONFIRMED: '已确认',
      CANCELLED: '已取消',
      COMPLETED: '已完成',
      CHECKED_IN: '已签到',
      NO_SHOW: '未到店',
      REQUESTED: '等待确认',
    },
    ctaLabel: '打开备用二维码',
    qrAlt: (bookingCode) => `预约二维码 ${bookingCode}`,
    qrHint: '到店时请向工作人员出示此二维码。',
    footerNote:
      '无需在线支付，也无需预付订金。如店铺需要确认，客服团队可能会与您联系。',
    textQrAttached: '预约二维码已附在本邮件中。',
    textQrBackup: '备用二维码',
    textArrival: '到店时请向工作人员出示二维码。',
  },
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
    const locale = this.normalizeLocale(input.locale);
    const template = bookingEmailTemplates[locale];
    const message = await transporter.sendMail({
      from,
      to: input.to,
      subject: template.subject(input.bookingCode),
      text: this.bookingEmailText(input, template),
      html: this.bookingEmailHtml(input, Boolean(qrAttachment), template),
      attachments: qrAttachment ? [qrAttachment] : undefined,
    });

    return { messageId: message.messageId ?? null };
  }

  async sendPasswordResetCodeEmail(
    input: PasswordResetEmailInput,
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
    const message = await transporter.sendMail({
      from,
      to: input.to,
      subject: 'Vietyoru - Mã đặt lại mật khẩu',
      text: this.passwordResetText(input),
      html: this.passwordResetHtml(input),
    });

    return { messageId: message.messageId ?? null };
  }

  async sendRegistrationOtpEmail(
    input: RegistrationOtpEmailInput,
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
    const message = await transporter.sendMail({
      from,
      to: input.to,
      subject: 'Vietyoru - Mã OTP xác thực email đăng ký',
      text: this.registrationOtpText(input),
      html: this.registrationOtpHtml(input),
    });

    return { messageId: message.messageId ?? null };
  }

  private bookingEmailText(
    input: BookingQrEmailInput,
    template: BookingEmailTemplate,
  ) {
    const guestName = input.guestName?.trim() || template.guestFallback;
    const rows = this.bookingEmailRows(input, template);

    return [
      template.intro(guestName),
      '',
      ...rows.map(([label, value]) => `${label}: ${value}`),
      '',
      template.textQrAttached,
      `${template.textQrBackup}: ${input.qrImageUrl}`,
      '',
      template.textArrival,
    ].join('\n');
  }

  private bookingEmailHtml(
    input: BookingQrEmailInput,
    hasQrAttachment: boolean,
    template: BookingEmailTemplate,
  ) {
    const qrSrc = hasQrAttachment ? 'cid:booking-qr' : input.qrImageUrl;
    const guestName = input.guestName?.trim() || template.guestFallback;
    const rows = this.bookingEmailRows(input, template);

    return `<!doctype html>
<html lang="${this.escapeAttribute(template.htmlLang)}">
  <body style="margin:0;background:#08080b;color:#f8f4e8;font-family:Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:28px 18px;">
      <h1 style="margin:0 0 8px;color:#f5d982;font-size:26px;">Vietyoru</h1>
      <p style="margin:0 0 22px;color:#b8b1a1;letter-spacing:3px;font-size:11px;">VIETNAM NIGHTLIFE GUIDE</p>
      <div style="border:1px solid rgba(245,217,130,.28);border-radius:14px;background:#141417;padding:22px;">
        <h2 style="margin:0 0 12px;font-size:22px;color:#fff;">${this.escapeHtml(template.title)}</h2>
        <p style="margin:0 0 20px;color:#cfc7b6;line-height:1.55;">
          ${this.escapeHtml(template.intro(guestName))}
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
          <img src="${this.escapeAttribute(qrSrc)}" alt="${this.escapeAttribute(template.qrAlt(input.bookingCode))}" width="220" height="220" style="display:inline-block;border-radius:12px;background:#fff;padding:10px;" />
          <p style="margin:12px 0 18px;color:#b8b1a1;font-size:13px;">${this.escapeHtml(template.qrHint)}</p>
          <a href="${this.escapeAttribute(input.qrImageUrl)}" style="display:inline-block;background:#f5d982;color:#1d1607;text-decoration:none;border-radius:999px;padding:12px 18px;font-size:14px;font-weight:800;">${this.escapeHtml(template.ctaLabel)}</a>
        </div>
        <p style="margin:18px 0 0;color:#8d8577;font-size:12px;line-height:1.5;">
          ${this.escapeHtml(template.footerNote)}
        </p>
      </div>
    </div>
  </body>
</html>`;
  }

  private bookingEmailRows(
    input: BookingQrEmailInput,
    template: BookingEmailTemplate,
  ): Array<[string, string]> {
    return [
      [template.labels.bookingCode, input.bookingCode],
      [template.labels.store, input.storeName || template.defaults.store],
      ...(input.castName
        ? ([[template.labels.cast, input.castName]] as Array<[string, string]>)
        : []),
      [
        template.labels.scheduledAt,
        this.formatDateTime(
          input.scheduledAt,
          template.intlLocale,
          template.defaults.scheduledAt,
        ),
      ],
      [
        template.labels.partySize,
        input.partySize == null
          ? template.defaults.partySize
          : String(input.partySize),
      ],
      [template.labels.amount, this.formatBookingAmount(input, template)],
      [template.labels.paymentMethod, template.defaults.paymentMethod],
      [template.labels.deliveryInfo, template.defaults.deliveryInfo],
      [template.labels.status, this.statusLabel(input.status, template)],
      ...(input.note
        ? ([[template.labels.note, input.note]] as Array<[string, string]>)
        : []),
    ];
  }

  private formatBookingAmount(
    input: BookingQrEmailInput,
    template: BookingEmailTemplate,
  ) {
    if (typeof input.amountVnd === 'number' && input.amountVnd > 0) {
      return this.formatMoney(input.amountVnd, template.intlLocale, 'VND');
    }

    return input.amountLabel || template.defaults.amount;
  }

  private passwordResetText(input: PasswordResetEmailInput) {
    return [
      `Xin chào ${input.displayName || 'bạn'},`,
      '',
      'Bạn vừa yêu cầu đặt lại mật khẩu tài khoản Vietyoru.',
      `Mã xác nhận của bạn là: ${input.code}`,
      `Mã có hiệu lực đến: ${this.formatDateTime(input.expiresAt)}`,
      '',
      'Nếu bạn không yêu cầu thao tác này, vui lòng bỏ qua email.',
    ].join('\n');
  }

  private passwordResetHtml(input: PasswordResetEmailInput) {
    return `<!doctype html>
<html>
  <body style="margin:0;background:#08080b;color:#f8f4e8;font-family:Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:28px 18px;">
      <h1 style="margin:0 0 8px;color:#f5d982;font-size:26px;">Vietyoru</h1>
      <p style="margin:0 0 22px;color:#b8b1a1;letter-spacing:3px;font-size:11px;">VIETNAM NIGHTLIFE GUIDE</p>
      <div style="border:1px solid rgba(245,217,130,.28);border-radius:14px;background:#141417;padding:22px;">
        <h2 style="margin:0 0 12px;font-size:22px;color:#fff;">Mã đặt lại mật khẩu</h2>
        <p style="margin:0 0 18px;color:#cfc7b6;line-height:1.55;">
          Xin chào ${this.escapeHtml(input.displayName || 'bạn')}, dùng mã dưới đây để xác nhận yêu cầu đặt lại mật khẩu.
        </p>
        <div style="margin:22px 0;padding:18px;border-radius:14px;background:#f5d982;color:#1d1607;text-align:center;font-size:32px;font-weight:900;letter-spacing:8px;">
          ${this.escapeHtml(input.code)}
        </div>
        <p style="margin:0;color:#b8b1a1;line-height:1.55;">
          Mã có hiệu lực đến <strong style="color:#fff;">${this.escapeHtml(this.formatDateTime(input.expiresAt))}</strong>. Nếu mã hết hạn, hãy yêu cầu gửi mã mới.
        </p>
        <p style="margin:18px 0 0;color:#8d8577;font-size:12px;line-height:1.5;">
          Nếu bạn không yêu cầu thao tác này, vui lòng bỏ qua email.
        </p>
      </div>
    </div>
  </body>
</html>`;
  }

  private registrationOtpText(input: RegistrationOtpEmailInput) {
    return [
      'Xin chào bạn,',
      '',
      'Bạn vừa yêu cầu tạo tài khoản hội viên Vietyoru.',
      `Mã OTP xác thực email của bạn là: ${input.code}`,
      `Mã có hiệu lực đến: ${this.formatDateTime(input.expiresAt)}`,
      '',
      'Nếu bạn không yêu cầu thao tác này, vui lòng bỏ qua email.',
    ].join('\n');
  }

  private registrationOtpHtml(input: RegistrationOtpEmailInput) {
    return `<!doctype html>
<html>
  <body style="margin:0;background:#08080b;color:#f8f4e8;font-family:Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:28px 18px;">
      <h1 style="margin:0 0 8px;color:#f5d982;font-size:26px;">Vietyoru</h1>
      <p style="margin:0 0 22px;color:#b8b1a1;letter-spacing:3px;font-size:11px;">VIETNAM NIGHTLIFE GUIDE</p>
      <div style="border:1px solid rgba(245,217,130,.28);border-radius:14px;background:#141417;padding:22px;">
        <h2 style="margin:0 0 12px;font-size:22px;color:#fff;">Mã OTP xác thực email</h2>
        <p style="margin:0 0 18px;color:#cfc7b6;line-height:1.55;">
          Dùng mã dưới đây để xác thực email và hoàn tất tạo tài khoản hội viên.
        </p>
        <div style="margin:22px 0;padding:18px;border-radius:14px;background:#f5d982;color:#1d1607;text-align:center;font-size:32px;font-weight:900;letter-spacing:8px;">
          ${this.escapeHtml(input.code)}
        </div>
        <p style="margin:0;color:#b8b1a1;line-height:1.55;">
          Mã có hiệu lực đến <strong style="color:#fff;">${this.escapeHtml(this.formatDateTime(input.expiresAt))}</strong>. Nếu mã hết hạn, hãy yêu cầu gửi mã mới.
        </p>
        <p style="margin:18px 0 0;color:#8d8577;font-size:12px;line-height:1.5;">
          Nếu bạn không yêu cầu thao tác này, vui lòng bỏ qua email.
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

  private formatDateTime(
    value?: Date | string | null,
    intlLocale = 'vi-VN',
    fallback = 'Chưa cập nhật',
  ) {
    if (!value) {
      return fallback;
    }

    const date = value instanceof Date ? value : new Date(value);
    if (!Number.isFinite(date.getTime())) {
      return String(value);
    }

    return new Intl.DateTimeFormat(intlLocale, {
      timeZone: this.configValue('EMAIL_TIME_ZONE') || 'Asia/Bangkok',
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour12: false,
    }).format(date);
  }

  private formatMoney(amount: number, intlLocale: string, currency: string) {
    return new Intl.NumberFormat(intlLocale, {
      style: 'currency',
      currency,
      currencyDisplay: 'code',
      maximumFractionDigits: currency === 'VND' ? 0 : 2,
    }).format(amount);
  }

  private statusLabel(status: string, template: BookingEmailTemplate) {
    return template.statusLabels[status] ?? template.statusLabels.REQUESTED;
  }

  private normalizeLocale(locale?: string | null): EmailLocale {
    const normalized =
      typeof locale === 'string' ? locale.trim().toLowerCase() : '';
    return normalized in bookingEmailTemplates
      ? (normalized as EmailLocale)
      : defaultEmailLocale;
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
