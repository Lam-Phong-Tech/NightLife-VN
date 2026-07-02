import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export const ADMIN_TELEGRAM_TEMPLATES = {
  bookingCreated: 'telegram.admin.booking.created.v1',
  bookingCancelled: 'telegram.admin.booking.cancelled.v1',
  billSubmitted: 'telegram.admin.bill.submitted.v1',
  billVerified: 'telegram.admin.bill.verified.v1',
  billRejected: 'telegram.admin.bill.rejected.v1',
  partnerRequested: 'telegram.admin.partner.requested.v1',
} as const;

type AdminTemplateKey =
  (typeof ADMIN_TELEGRAM_TEMPLATES)[keyof typeof ADMIN_TELEGRAM_TEMPLATES];

type AdminNotificationRelations = {
  userId?: string | null;
  guestId?: string | null;
  storeId?: string | null;
  bookingId?: string | null;
  billId?: string | null;
};

type AdminTelegramNotification = AdminNotificationRelations & {
  templateKey: AdminTemplateKey;
  title: string;
  lines: Array<[label: string, value: unknown]>;
  cmsPath: string;
  webPath?: string;
  actions?: Array<{ text: string; callbackData: string }>;
  payload?: Record<string, unknown>;
};

export type BookingAdminNotification = {
  id: string;
  status: string;
  scheduledAt?: Date | string | null;
  partySize?: number | null;
  note?: string | null;
  storeId?: string | null;
  user?: {
    id: string;
    displayName?: string | null;
    tier?: string | null;
  } | null;
  guest?: {
    id: string;
    displayName?: string | null;
    phone?: string | null;
    email?: string | null;
  } | null;
  store?: { id: string; name: string; slug: string } | null;
  cast?: {
    id: string;
    slug: string;
    stageName: string;
    publicAlias?: string | null;
  } | null;
};

export type BillAdminNotification = {
  id: string;
  status: string;
  billNumber?: string | null;
  totalVnd?: number | null;
  subtotalVnd?: number | null;
  discountVnd?: number | null;
  submittedAt?: Date | string | null;
  reviewedAt?: Date | string | null;
  verifiedAt?: Date | string | null;
  rejectedAt?: Date | string | null;
  rejectReason?: string | null;
  user?: {
    id: string;
    displayName?: string | null;
    tier?: string | null;
  } | null;
  guest?: {
    id: string;
    displayName?: string | null;
    phone?: string | null;
  } | null;
  store?: { id: string; name: string; slug: string } | null;
  booking?: {
    id: string;
    status?: string | null;
    scheduledAt?: Date | string | null;
  } | null;
  coupon?: { id: string; code: string; name: string } | null;
};

export type PartnerRequestAdminNotification = {
  id: string;
  draftStoreId?: string | null;
  draftStoreName?: string | null;
  draftStoreSlug?: string | null;
  draftCastIds?: string[];
  draftMediaIds?: string[];
  draftContentIds?: string[];
  businessName: string;
  businessType?: string | null;
  area?: string | null;
  contactName: string;
  contactPhone: string;
  contactEmail?: string | null;
  note?: string | null;
  storeDescription?: string | null;
  storeAddress?: string | null;
  storeCity?: string | null;
  storeDistrict?: string | null;
  openingHours?: string | null;
  menuSummary?: string | null;
  mediaUrls?: string[];
  castProfiles?: Array<{
    stageName: string;
    bio?: string | null;
    tags?: string[];
    languages?: string[];
    hourlyRateVnd?: number | null;
    mediaUrls?: string[];
  }>;
  submittedAt: Date | string;
};

@Injectable()
export class AdminNotificationService {
  private readonly logger = new Logger(AdminNotificationService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  notifyBookingCreated(booking: BookingAdminNotification) {
    return this.notifyAdmin({
      templateKey: ADMIN_TELEGRAM_TEMPLATES.bookingCreated,
      title: 'Booking moi',
      userId: booking.user?.id,
      guestId: booking.guest?.id,
      storeId: booking.store?.id ?? booking.storeId,
      bookingId: booking.id,
      cmsPath: `/admin?tab=bookings&bookingId=${encodeURIComponent(booking.id)}`,
      webPath: booking.store?.slug
        ? `/stores/${booking.store.slug}`
        : undefined,
      lines: [
        ['Booking', booking.id],
        ['Quan', booking.store?.name],
        ['Khach', this.customerLabel(booking)],
        ['Thoi gian', this.formatDateTime(booking.scheduledAt)],
        ['So khach', booking.partySize],
        ['Cast', this.castLabel(booking.cast)],
        ['Ghi chu', booking.note],
      ],
      actions: [
        {
          text: 'Xac nhan',
          callbackData: `accept_booking_${booking.id}`,
        },
      ],
      payload: this.bookingPayload(booking),
    });
  }

  notifyBookingCancelled(
    booking: BookingAdminNotification,
    options: { reason?: string | null } = {},
  ) {
    return this.notifyAdmin({
      templateKey: ADMIN_TELEGRAM_TEMPLATES.bookingCancelled,
      title: 'Booking bi huy',
      userId: booking.user?.id,
      guestId: booking.guest?.id,
      storeId: booking.store?.id ?? booking.storeId,
      bookingId: booking.id,
      cmsPath: `/admin?tab=bookings&bookingId=${encodeURIComponent(booking.id)}`,
      webPath: booking.store?.slug
        ? `/stores/${booking.store.slug}`
        : undefined,
      lines: [
        ['Booking', booking.id],
        ['Quan', booking.store?.name],
        ['Khach', this.customerLabel(booking)],
        ['Thoi gian', this.formatDateTime(booking.scheduledAt)],
        ['Trang thai', booking.status],
        ['Ly do', options.reason],
      ],
      payload: {
        ...this.bookingPayload(booking),
        reason: options.reason ?? null,
      },
    });
  }

  notifyBillSubmitted(bill: BillAdminNotification) {
    return this.notifyAdmin({
      templateKey: ADMIN_TELEGRAM_TEMPLATES.billSubmitted,
      title: 'Bill moi cho duyet',
      userId: bill.user?.id,
      guestId: bill.guest?.id,
      storeId: bill.store?.id,
      bookingId: bill.booking?.id,
      billId: bill.id,
      cmsPath: `/admin?tab=bills&billId=${encodeURIComponent(bill.id)}`,
      webPath: bill.store?.slug ? `/stores/${bill.store.slug}` : '/gui-hoa-don',
      lines: [
        ['Bill', bill.billNumber ?? bill.id],
        ['Quan', bill.store?.name],
        ['Khach', this.customerLabel(bill)],
        ['Tong tien', this.formatMoney(bill.totalVnd)],
        ['Booking', bill.booking?.id],
        ['Gui luc', this.formatDateTime(bill.submittedAt)],
      ],
      payload: this.billPayload(bill),
    });
  }

  notifyBillReviewed(
    bill: BillAdminNotification,
    options: { approve: boolean; reviewedById?: string | null },
  ) {
    return this.notifyAdmin({
      templateKey: options.approve
        ? ADMIN_TELEGRAM_TEMPLATES.billVerified
        : ADMIN_TELEGRAM_TEMPLATES.billRejected,
      title: options.approve ? 'Bill da duyet' : 'Bill bi tu choi',
      userId: bill.user?.id,
      guestId: bill.guest?.id,
      storeId: bill.store?.id,
      bookingId: bill.booking?.id,
      billId: bill.id,
      cmsPath: `/admin?tab=bills&billId=${encodeURIComponent(bill.id)}`,
      webPath: bill.store?.slug ? `/stores/${bill.store.slug}` : '/gui-hoa-don',
      lines: [
        ['Bill', bill.billNumber ?? bill.id],
        ['Trang thai', bill.status],
        ['Quan', bill.store?.name],
        ['Khach', this.customerLabel(bill)],
        ['Tong tien', this.formatMoney(bill.totalVnd)],
        ['Review luc', this.formatDateTime(bill.reviewedAt)],
        ['Ly do tu choi', bill.rejectReason],
      ],
      payload: {
        ...this.billPayload(bill),
        approve: options.approve,
        reviewedById: options.reviewedById ?? null,
      },
    });
  }

  notifyPartnerRequest(request: PartnerRequestAdminNotification) {
    return this.notifyAdmin({
      templateKey: ADMIN_TELEGRAM_TEMPLATES.partnerRequested,
      title: 'Partner request moi',
      storeId: request.draftStoreId ?? undefined,
      cmsPath: `/admin?tab=partners&requestId=${encodeURIComponent(request.id)}`,
      webPath: '/dang-ky-doi-tac',
      lines: [
        ['Request', request.id],
        ['Quan / co so', request.draftStoreName ?? request.businessName],
        ['Loai hinh', request.businessType],
        ['Khu vuc', request.area],
        ['Lien he', `${request.contactName} - ${request.contactPhone}`],
        ['Email', request.contactEmail],
        ['Draft store', request.draftStoreId],
        ['Cast draft', request.draftCastIds?.length],
        ['Media draft', request.draftMediaIds?.length],
        ['Gui luc', this.formatDateTime(request.submittedAt)],
        ['Ghi chu', request.note],
      ],
      payload: {
        requestId: request.id,
        status: 'PENDING_REVIEW',
        reviewReason: null,
        reviewedAt: null,
        reviewedById: null,
        draftStoreId: request.draftStoreId ?? null,
        draftStoreName: request.draftStoreName ?? request.businessName,
        draftStoreSlug: request.draftStoreSlug ?? null,
        draftCastIds: request.draftCastIds ?? [],
        draftMediaIds: request.draftMediaIds ?? [],
        draftContentIds: request.draftContentIds ?? [],
        businessName: request.businessName,
        businessType: request.businessType ?? null,
        area: request.area ?? null,
        contactName: request.contactName,
        contactPhone: request.contactPhone,
        contactEmail: request.contactEmail ?? null,
        note: request.note ?? null,
        storeDescription: request.storeDescription ?? null,
        storeAddress: request.storeAddress ?? null,
        storeCity: request.storeCity ?? null,
        storeDistrict: request.storeDistrict ?? null,
        openingHours: request.openingHours ?? null,
        menuSummary: request.menuSummary ?? null,
        mediaUrls: request.mediaUrls ?? [],
        castProfiles: request.castProfiles ?? [],
        submittedAt: this.toIso(request.submittedAt),
      },
    });
  }

  private async notifyAdmin(input: AdminTelegramNotification) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN')?.trim();
    const chatId = this.telegramAdminChatId();
    const text = this.buildMessage(input);
    const actionUrl = this.absoluteUrl(
      this.configService.get<string>('CMS_BASE_URL', 'http://localhost:3000'),
      input.cmsPath,
    );
    const webUrl = this.absoluteUrl(
      this.configService.get<string>('WEB_BASE_URL', 'http://localhost:3000'),
      input.webPath ?? '/',
    );
    const payload = {
      priority: 'P0',
      templateKey: input.templateKey,
      title: input.title,
      text,
      actionUrl,
      webUrl,
      ...input.payload,
    } satisfies Prisma.InputJsonObject;
    const configured = Boolean(token && chatId);
    const missingConfigError = configured
      ? undefined
      : 'TELEGRAM_BOT_TOKEN and an admin chat id are required';

    try {
      const log = await this.prisma.notificationLog.create({
        data: {
          userId: input.userId ?? undefined,
          guestId: input.guestId ?? undefined,
          storeId: input.storeId ?? undefined,
          bookingId: input.bookingId ?? undefined,
          billId: input.billId ?? undefined,
          channel: 'TELEGRAM',
          status: configured ? 'QUEUED' : 'FAILED',
          recipient: chatId ?? 'TELEGRAM_ADMIN_CHAT_ID',
          templateKey: input.templateKey,
          payload,
          error: missingConfigError,
        },
      });

      if (!configured) {
        return;
      }

      await this.sendTelegramMessage(
        token as string,
        chatId as string,
        text,
        input.actions,
      );
      await this.prisma.notificationLog.update({
        where: { id: log.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          error: null,
        },
      });
    } catch (error) {
      this.logger.warn(
        `Admin Telegram notification failed: ${this.errorMessage(error)}`,
      );

      if (configured) {
        await this.markLastAttemptFailed(input, payload, chatId, error);
      }
    }
  }

  private async markLastAttemptFailed(
    input: AdminTelegramNotification,
    payload: Prisma.InputJsonObject,
    chatId: string | undefined,
    error: unknown,
  ) {
    try {
      await this.prisma.notificationLog.create({
        data: {
          userId: input.userId ?? undefined,
          guestId: input.guestId ?? undefined,
          storeId: input.storeId ?? undefined,
          bookingId: input.bookingId ?? undefined,
          billId: input.billId ?? undefined,
          channel: 'TELEGRAM',
          status: 'FAILED',
          recipient: chatId ?? 'TELEGRAM_ADMIN_CHAT_ID',
          templateKey: input.templateKey,
          payload,
          error: this.errorMessage(error),
        },
      });
    } catch (logError) {
      this.logger.warn(
        `Failed to write Telegram notification failure log: ${this.errorMessage(logError)}`,
      );
    }
  }

  private async sendTelegramMessage(
    token: string,
    chatId: string,
    text: string,
    actions: AdminTelegramNotification['actions'] = [],
  ) {
    const threadId = this.parseThreadId(
      this.configService.get<string>('TELEGRAM_ADMIN_THREAD_ID'),
    );
    const body: Record<string, unknown> = {
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    };

    if (threadId) {
      body.message_thread_id = threadId;
    }

    if (actions.length) {
      body.reply_markup = {
        inline_keyboard: [
          actions.map((action) => ({
            text: action.text,
            callback_data: action.callbackData,
          })),
        ],
      };
    }

    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(
        `Telegram sendMessage failed with ${response.status}${detail ? `: ${detail}` : ''}`,
      );
    }
  }

  private telegramAdminChatId() {
    return (
      this.configService.get<string>('TELEGRAM_ADMIN_CHAT_ID')?.trim() ||
      this.configService.get<string>('TELEGRAM_CHAT_ID')?.trim() ||
      this.configService.get<string>('TELEGRAM_OPS_CHAT_ID')?.trim()
    );
  }

  private buildMessage(input: AdminTelegramNotification) {
    const actionUrl = this.absoluteUrl(
      this.configService.get<string>('CMS_BASE_URL', 'http://localhost:3000'),
      input.cmsPath,
    );
    const webUrl = this.absoluteUrl(
      this.configService.get<string>('WEB_BASE_URL', 'http://localhost:3000'),
      input.webPath ?? '/',
    );
    const details = input.lines
      .map(([label, value]) => [label, this.formatValue(value)] as const)
      .filter(([, value]) => value)
      .map(([label, value]) => `${label}: ${value}`);

    return [
      `[P0] ${input.title}`,
      ...details,
      `CMS: ${actionUrl}`,
      `Web: ${webUrl}`,
    ].join('\n');
  }

  private bookingPayload(booking: BookingAdminNotification) {
    return {
      bookingId: booking.id,
      status: booking.status,
      scheduledAt: this.toIso(booking.scheduledAt),
      partySize: booking.partySize ?? null,
      store: booking.store
        ? {
            id: booking.store.id,
            name: booking.store.name,
            slug: booking.store.slug,
          }
        : null,
      cast: booking.cast
        ? {
            id: booking.cast.id,
            slug: booking.cast.slug,
            stageName: booking.cast.stageName,
            publicAlias: booking.cast.publicAlias ?? null,
          }
        : null,
      customer: this.customerPayload(booking),
      note: booking.note ?? null,
    };
  }

  private billPayload(bill: BillAdminNotification) {
    return {
      billId: bill.id,
      billNumber: bill.billNumber ?? null,
      status: bill.status,
      totalVnd: bill.totalVnd ?? null,
      subtotalVnd: bill.subtotalVnd ?? null,
      discountVnd: bill.discountVnd ?? null,
      submittedAt: this.toIso(bill.submittedAt),
      reviewedAt: this.toIso(bill.reviewedAt),
      verifiedAt: this.toIso(bill.verifiedAt),
      rejectedAt: this.toIso(bill.rejectedAt),
      rejectReason: bill.rejectReason ?? null,
      bookingId: bill.booking?.id ?? null,
      store: bill.store
        ? {
            id: bill.store.id,
            name: bill.store.name,
            slug: bill.store.slug,
          }
        : null,
      customer: this.customerPayload(bill),
    };
  }

  private customerPayload(input: {
    user?: {
      id: string;
      displayName?: string | null;
      tier?: string | null;
    } | null;
    guest?: {
      id: string;
      displayName?: string | null;
      phone?: string | null;
      email?: string | null;
    } | null;
  }) {
    return {
      userId: input.user?.id ?? null,
      guestId: input.guest?.id ?? null,
      displayName:
        input.user?.displayName ?? input.guest?.displayName ?? 'Khach moi',
      tier: input.user?.tier ?? null,
      phone: input.guest?.phone ?? null,
      email: input.guest?.email ?? null,
    };
  }

  private customerLabel(input: {
    user?: { displayName?: string | null; tier?: string | null } | null;
    guest?: {
      displayName?: string | null;
      phone?: string | null;
      email?: string | null;
    } | null;
  }) {
    const name =
      input.user?.displayName ?? input.guest?.displayName ?? 'Khach moi';
    const tier = input.user?.tier ? ` (${input.user.tier})` : '';
    const contact = input.guest?.phone ?? input.guest?.email;

    return `${name}${tier}${contact ? ` - ${contact}` : ''}`;
  }

  private castLabel(
    cast:
      | {
          stageName: string;
          publicAlias?: string | null;
        }
      | null
      | undefined,
  ) {
    if (!cast) {
      return null;
    }

    return cast.publicAlias ?? cast.stageName;
  }

  private formatValue(value: unknown) {
    if (value === undefined || value === null || value === '') {
      return '';
    }

    if (value instanceof Date) {
      return this.formatDateTime(value);
    }

    return String(value);
  }

  private formatDateTime(value?: Date | string | null) {
    if (!value) {
      return null;
    }

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: this.configService.get<string>(
        'TELEGRAM_NOTIFICATION_TIME_ZONE',
        'Asia/Bangkok',
      ),
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  }

  private formatMoney(value?: number | null) {
    if (value === undefined || value === null) {
      return null;
    }

    return `${new Intl.NumberFormat('vi-VN').format(value)} VND`;
  }

  private toIso(value?: Date | string | null) {
    if (!value) {
      return null;
    }

    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
  }

  private absoluteUrl(baseUrl: string, path: string) {
    const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    return `${normalizedBaseUrl}${normalizedPath}`;
  }

  private parseThreadId(value?: string) {
    if (!value) {
      return null;
    }

    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }

  private errorMessage(error: unknown) {
    return error instanceof Error ? error.message : String(error);
  }
}
