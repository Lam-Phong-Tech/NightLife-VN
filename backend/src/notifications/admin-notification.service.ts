import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { request as httpsRequest } from 'node:https';
import { PrismaService } from '../prisma/prisma.service';
import {
  formatBillTelegramMessage,
  formatBookingCancelledTelegramMessage,
  formatBookingRequestTelegramMessage,
  formatPartnerRequestTelegramMessage,
} from './admin-telegram-message.formatter';

export const ADMIN_TELEGRAM_TEMPLATES = {
  bookingCreated: 'telegram.admin.booking.created.v1',
  tourBookingCreated: 'telegram.admin.tour-booking.created.v1',
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
  message?: string;
  payload?: Record<string, unknown>;
};

export type BookingAdminNotification = {
  id: string;
  /** Stable, auto-incremented number displayed as STT in the Admin booking list. */
  bookingNumber?: number | null;
  bookingSequenceCode?: string | null;
  bookingCode?: string | null;
  tourBookingId?: string | null;
  tourBooking?: {
    bookingCode?: string | null;
    itinerarySnapshot?: unknown;
  } | null;
  status: string;
  scheduledAt?: Date | string | null;
  createdAt?: Date | string | null;
  partySize?: number | null;
  discountSnapshot?: unknown;
  note?: string | null;
  storeId?: string | null;
  user?: {
    id: string;
    email?: string | null;
    displayName?: string | null;
    tier?: string | null;
  } | null;
  guest?: {
    id: string;
    displayName?: string | null;
    phone?: string | null;
    email?: string | null;
  } | null;
  store?: {
    id: string;
    name: string;
    slug: string;
    category?: string | null;
  } | null;
  cast?: {
    id: string;
    slug: string;
    stageName: string;
    publicAlias?: string | null;
  } | null;
  coupon?: {
    code?: string | null;
    discountType?: string | null;
    discountValue?: number | null;
  } | null;
  couponIssue?: { code?: string | null } | null;
};

export type TourBookingAdminNotification = {
  id: string;
  bookingCode?: string | null;
  status: string;
  scheduledAt?: Date | string | null;
  partySize?: number | null;
  note?: string | null;
  titleSnapshot?: string | null;
  tour?: { id: string; title: string } | null;
  user?: BookingAdminNotification['user'];
  guest?: BookingAdminNotification['guest'];
  bookings: Array<BookingAdminNotification & { tourStopOrder?: number | null }>;
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
  mapUrl?: string | null;
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

  async notifyBookingCreated(booking: BookingAdminNotification) {
    const bookingSequenceCode =
      booking.bookingSequenceCode ?? (await this.bookingSequenceCode(booking));

    return this.notifyAdmin({
      templateKey: ADMIN_TELEGRAM_TEMPLATES.bookingCreated,
      title: 'Yêu cầu đặt bàn mới',
      userId: booking.user?.id,
      guestId: booking.guest?.id,
      storeId: booking.store?.id ?? booking.storeId,
      bookingId: booking.id,
      cmsPath: `/admin?tab=bookings&bookingId=${encodeURIComponent(booking.id)}`,
      webPath: booking.store?.slug
        ? `/stores/${booking.store.slug}`
        : undefined,
      message: formatBookingRequestTelegramMessage(
        this.bookingMessageInput(booking, bookingSequenceCode),
      ),
      lines: [
        ['STT', bookingSequenceCode],
        ['Booking', booking.bookingCode],
        ['Mã đặt tour', booking.tourBooking?.bookingCode],
        ['Quán', booking.store?.name],
        ['Khách hàng', this.customerName(booking)],
        ['Email', this.customerEmail(booking)],
        ['Loại khách', this.customerType(booking)],
        ['Mức giảm', this.bookingDiscountLabel(booking)],
        ['Thời gian', this.formatDateTime(booking.scheduledAt)],
        ['Số khách', booking.partySize],
        ['Cast', this.castLabel(booking.cast)],
        ['Ghi chú', booking.note],
      ],
      payload: this.bookingPayload(booking, bookingSequenceCode),
    });
  }

  async notifyTourBookingCreated(tourBooking: TourBookingAdminNotification) {
    const stops = [...tourBooking.bookings].sort(
      (first, second) =>
        (first.tourStopOrder ?? Number.MAX_SAFE_INTEGER) -
        (second.tourStopOrder ?? Number.MAX_SAFE_INTEGER),
    );
    const primaryBooking = stops[0];
    const tourTitle =
      tourBooking.tour?.title ?? tourBooking.titleSnapshot ?? 'Nightlife Tour';
    const itinerary = stops
      .map((booking, index) => {
        const order = booking.tourStopOrder ?? index + 1;
        const cast = this.castLabel(booking.cast);
        return `${order}. ${booking.store?.name ?? 'Quán'}${cast ? ` · Cast: ${cast}` : ''}`;
      })
      .join('\n');

    const lines: Array<[string, unknown]> = [
      ['🎫 Mã đặt tour', tourBooking.bookingCode],
      ['🗺️ Tên tour', tourTitle],
      ['📍 Lịch trình tour', itinerary],
      ['📅 Thời gian', this.formatDateTime(tourBooking.scheduledAt)],
      ['👥 Số người', tourBooking.partySize],
      ['👤 Người đặt', this.customerName(tourBooking)],
      ['📧 Email', this.customerEmail(tourBooking)],
      ['💬 Ghi chú', tourBooking.note],
    ];

    const details = lines
      .map(([label, value]) => [label, this.formatValue(value)] as const)
      .filter(([, value]) => value)
      .map(([label, value]) => `${label}: ${value}`);

    const message = [
      '[P0] Yêu cầu đặt tour mới',
      ...details,
    ].join('\n');

    return this.notifyAdmin({
      templateKey: ADMIN_TELEGRAM_TEMPLATES.tourBookingCreated,
      title: 'Yêu cầu đặt tour mới',
      userId: tourBooking.user?.id,
      guestId: tourBooking.guest?.id,
      bookingId: primaryBooking?.id,
      cmsPath: primaryBooking?.id
        ? `/admin/bookings?bookingId=${encodeURIComponent(primaryBooking.id)}`
        : '/admin/bookings',
      webPath: tourBooking.tour?.id
        ? `/tour/${encodeURIComponent(tourBooking.tour.id)}`
        : '/tour',
      lines,
      message,
      payload: {
        tourBookingId: tourBooking.id,
        tourBookingCode: tourBooking.bookingCode ?? null,
        tourId: tourBooking.tour?.id ?? null,
        tourTitle,
        status: tourBooking.status,
        scheduledAt: this.toIso(tourBooking.scheduledAt),
        partySize: tourBooking.partySize ?? null,
        customer: this.customerPayload(tourBooking),
        stops: stops.map((booking, index) => ({
          order: booking.tourStopOrder ?? index + 1,
          bookingId: booking.id,
          bookingCode: booking.bookingCode ?? null,
          storeId: booking.store?.id ?? null,
          storeName: booking.store?.name ?? null,
          castName: this.castLabel(booking.cast),
        })),
      },
    });
  }

  notifyBookingCancelled(
    booking: BookingAdminNotification,
    options: { reason?: string | null } = {},
  ) {
    return this.notifyAdmin({
      templateKey: ADMIN_TELEGRAM_TEMPLATES.bookingCancelled,
      title: 'Booking đã hủy',
      userId: booking.user?.id,
      guestId: booking.guest?.id,
      storeId: booking.store?.id ?? booking.storeId,
      bookingId: booking.id,
      cmsPath: `/admin?tab=bookings&bookingId=${encodeURIComponent(booking.id)}`,
      webPath: booking.store?.slug
        ? `/stores/${booking.store.slug}`
        : undefined,
      message: formatBookingCancelledTelegramMessage({
        ...this.bookingMessageInput(booking),
        reason: options.reason,
      }),
      lines: [
        ['Booking', booking.bookingCode],
        ['Quán', booking.store?.name],
        ['Khách hàng', this.customerName(booking)],
        ['Email', this.customerEmail(booking)],
        ['Loại khách', this.customerType(booking)],
        ['Mức giảm', this.bookingDiscountLabel(booking)],
        ['Thời gian', this.formatDateTime(booking.scheduledAt)],
        ['Số khách', booking.partySize],
        ['Cast', this.castLabel(booking.cast)],
        ['Ghi chú', booking.note],
        ['Trạng thái', this.bookingStatusLabel(booking.status)],
        ['Lý do hủy', options.reason],
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
      title: 'Hóa đơn mới chờ duyệt',
      userId: bill.user?.id,
      guestId: bill.guest?.id,
      storeId: bill.store?.id,
      bookingId: bill.booking?.id,
      billId: bill.id,
      cmsPath: `/admin?tab=bills&billId=${encodeURIComponent(bill.id)}`,
      webPath: bill.store?.slug ? `/stores/${bill.store.slug}` : '/gui-hoa-don',
      message: formatBillTelegramMessage(
        this.billMessageInput(bill, 'Hóa đơn mới chờ duyệt'),
      ),
      lines: [
        ['Bill', bill.billNumber ?? bill.id],
        ['Quán', bill.store?.name],
        ['Khách hàng', this.customerName(bill)],
        ['Tổng tiền', this.formatMoney(bill.totalVnd)],
        ['Booking', bill.booking?.id],
        ['Gửi lúc', this.formatDateTime(bill.submittedAt)],
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
      title: options.approve ? 'Hóa đơn đã duyệt' : 'Hóa đơn bị từ chối',
      userId: bill.user?.id,
      guestId: bill.guest?.id,
      storeId: bill.store?.id,
      bookingId: bill.booking?.id,
      billId: bill.id,
      cmsPath: `/admin?tab=bills&billId=${encodeURIComponent(bill.id)}`,
      webPath: bill.store?.slug ? `/stores/${bill.store.slug}` : '/gui-hoa-don',
      message: formatBillTelegramMessage(
        this.billMessageInput(
          bill,
          options.approve ? 'Hóa đơn đã duyệt' : 'Hóa đơn bị từ chối',
        ),
      ),
      lines: [
        ['Bill', bill.billNumber ?? bill.id],
        ['Trạng thái', bill.status],
        ['Quán', bill.store?.name],
        ['Khách hàng', this.customerName(bill)],
        ['Tổng tiền', this.formatMoney(bill.totalVnd)],
        ['Review lúc', this.formatDateTime(bill.reviewedAt)],
        ['Lý do từ chối', bill.rejectReason],
      ],
      payload: {
        ...this.billPayload(bill),
        approve: options.approve,
        reviewedById: options.reviewedById ?? null,
      },
    });
  }

  notifyPartnerRequest(request: PartnerRequestAdminNotification) {
    const isUpdate = request.id.startsWith('LISTING-');
    return this.notifyAdmin({
      templateKey: ADMIN_TELEGRAM_TEMPLATES.partnerRequested,
      title: isUpdate ? 'Yêu cầu đối tác chỉnh sửa' : 'Yêu cầu đối tác mới',
      storeId: request.draftStoreId ?? undefined,
      cmsPath: `/admin?tab=partners&requestId=${encodeURIComponent(request.id)}`,
      webPath: '/dang-ky-doi-tac',
      message: formatPartnerRequestTelegramMessage({
        businessName: request.draftStoreName ?? request.businessName,
        businessType: request.businessType,
        area: request.area,
        contactName: request.contactName,
        contactPhone: request.contactPhone,
        contactEmail: request.contactEmail,
        submittedAt: request.submittedAt,
        note: request.note,
        timeZone: this.telegramNotificationTimeZone(),
        isUpdate,
      }),
      lines: [
        ['Request', request.id],
        ['Quán / cơ sở', request.draftStoreName ?? request.businessName],
        ['Loại hình', request.businessType],
        ['Khu vực', request.area],
        ['Maps', request.mapUrl],
        ['Liên hệ', `${request.contactName} - ${request.contactPhone}`],
        ['Email', request.contactEmail],
        ['Draft store', request.draftStoreId],
        ['Cast draft', request.draftCastIds?.length],
        ['Media draft', request.draftMediaIds?.length],
        ['Gửi lúc', this.formatDateTime(request.submittedAt)],
        ['Ghi chú', request.note],
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
        mapUrl: request.mapUrl ?? null,
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
        return log.id;
      }

      await this.sendTelegramMessage(token as string, chatId as string, text);
      await this.prisma.notificationLog.update({
        where: { id: log.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          error: null,
        },
      });
      return log.id;
    } catch (error) {
      this.logger.warn(
        `Admin Telegram notification failed: ${this.errorMessage(error)}`,
      );

      if (configured) {
        await this.markLastAttemptFailed(input, payload, chatId, error);
      }
      return null;
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

    const payload = JSON.stringify(body);
    let lastError: unknown;

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const response = await this.postToTelegram(
          `/bot${token}/sendMessage`,
          payload,
        );

        if (response.statusCode < 200 || response.statusCode >= 300) {
          throw new Error(
            `Telegram sendMessage failed with ${response.statusCode}${response.body ? `: ${response.body}` : ''}`,
          );
        }

        return;
      } catch (error) {
        lastError = error;
        if (attempt === 3 || !this.shouldRetryTelegramError(error)) {
          throw error;
        }

        this.logger.warn(
          `Telegram notification attempt ${attempt} failed; retrying over IPv4. ${this.errorMessage(error)}`,
        );
        await this.delay(attempt * 750);
      }
    }

    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  }

  private postToTelegram(path: string, payload: string) {
    return new Promise<{ statusCode: number; body: string }>(
      (resolve, reject) => {
        const request = httpsRequest(
          {
            hostname: 'api.telegram.org',
            port: 443,
            path,
            method: 'POST',
            family: 4,
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(payload),
            },
          },
          (response) => {
            const chunks: Buffer[] = [];
            response.on('data', (chunk: Buffer) => chunks.push(chunk));
            response.on('end', () => {
              resolve({
                statusCode: response.statusCode ?? 0,
                body: Buffer.concat(chunks).toString('utf8'),
              });
            });
          },
        );

        request.setTimeout(15_000, () => {
          request.destroy(
            new Error('Telegram request timed out after 15000ms'),
          );
        });
        request.once('error', reject);
        request.end(payload);
      },
    );
  }

  private shouldRetryTelegramError(error: unknown) {
    const message = this.errorMessage(error);
    return !/Telegram sendMessage failed with 4(?!29)/.test(message);
  }

  private delay(milliseconds: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
  }

  private async bookingSequenceCode(booking: BookingAdminNotification) {
    try {
      const sequence = await this.bookingSequenceNumber(booking);
      return sequence ? `NLF-${sequence}` : null;
    } catch (error) {
      this.logger.warn(
        `Failed to resolve booking Telegram STT: ${this.errorMessage(error)}`,
      );
      return null;
    }
  }

  private async bookingSequenceNumber(booking: BookingAdminNotification) {
    // The Admin screen uses Booking.bookingNumber.  Reuse that immutable value
    // for Telegram instead of deriving a number from createdAt: several
    // bookings can share the same timestamp and would then receive one STT.
    if (
      typeof booking.bookingNumber === 'number' &&
      Number.isInteger(booking.bookingNumber) &&
      booking.bookingNumber > 0
    ) {
      return booking.bookingNumber;
    }

    let anchorCreatedAt = this.toValidDate(booking.createdAt);

    if (booking.tourBookingId) {
      const tourBooking = await this.prisma.tourBooking.findUnique({
        where: { id: booking.tourBookingId },
        select: { createdAt: true },
      });
      anchorCreatedAt = tourBooking?.createdAt ?? anchorCreatedAt;
    }

    const bookingCreatedAtWhere: Prisma.BookingWhereInput = anchorCreatedAt
      ? { createdAt: { lte: anchorCreatedAt } }
      : {};
    const tourCreatedAtWhere: Prisma.TourBookingWhereInput = anchorCreatedAt
      ? { createdAt: { lte: anchorCreatedAt } }
      : {};
    const [standaloneBookingCount, tourBookingCount] = await Promise.all([
      this.prisma.booking.count({
        where: {
          tourBookingId: null,
          ...bookingCreatedAtWhere,
        },
      }),
      this.prisma.tourBooking.count({
        where: tourCreatedAtWhere,
      }),
    ]);

    return standaloneBookingCount + tourBookingCount;
  }

  private telegramAdminChatId() {
    return (
      this.configService.get<string>('TELEGRAM_ADMIN_CHAT_ID')?.trim() ||
      this.configService.get<string>('TELEGRAM_CHAT_ID')?.trim() ||
      this.configService.get<string>('TELEGRAM_OPS_CHAT_ID')?.trim()
    );
  }

  private buildMessage(input: AdminTelegramNotification) {
    if (input.message) {
      return input.message;
    }

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

  private bookingPayload(
    booking: BookingAdminNotification,
    bookingSequenceCode?: string | null,
  ) {
    return {
      bookingId: booking.id,
      bookingSequenceCode: bookingSequenceCode ?? null,
      bookingCode: booking.bookingCode,
      tourBookingCode: booking.tourBooking?.bookingCode ?? null,
      status: booking.status,
      statusLabel: this.bookingStatusLabel(booking.status),
      scheduledAt: this.toIso(booking.scheduledAt),
      partySize: booking.partySize ?? null,
      customerType: this.customerType(booking),
      discountLabel: this.bookingDiscountLabel(booking),
      qrStatus: this.bookingQrStatus(),
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

  private bookingMessageInput(
    booking: BookingAdminNotification,
    bookingSequenceCode?: string | null,
  ) {
    return {
      bookingSequenceCode,
      bookingCode: booking.bookingCode,
      tourBookingCode: booking.tourBooking?.bookingCode ?? null,
      storeName: booking.store?.name,
      storeCategory: booking.store?.category,
      customerName: this.customerName(booking),
      customerEmail: this.customerEmail(booking),
      customerType: this.customerType(booking),
      discountLabel: this.bookingDiscountLabel(booking),
      contact: this.customerContact(booking),
      scheduledAt: booking.scheduledAt,
      partySize: booking.partySize,
      castName: this.tourCastNames(booking) ?? this.castLabel(booking.cast),
      note: booking.note,
      status: booking.status,
      qrStatus: this.bookingQrStatus(),
      bookingStatusLabel: this.bookingStatusLabel(booking.status),
      timeZone: this.telegramNotificationTimeZone(),
    };
  }

  private billMessageInput(bill: BillAdminNotification, title: string) {
    return {
      title,
      storeName: bill.store?.name,
      customerName: this.customerName(bill),
      total: this.formatMoney(bill.totalVnd),
      bookingId: bill.booking?.id,
      couponName: bill.coupon?.name ?? bill.coupon?.code,
      submittedAt: bill.submittedAt,
      reviewedAt: bill.reviewedAt,
      rejectReason: bill.rejectReason,
      timeZone: this.telegramNotificationTimeZone(),
    };
  }

  private tourCastNames(booking: BookingAdminNotification) {
    const itinerary = booking.tourBooking?.itinerarySnapshot;
    if (!Array.isArray(itinerary) || !booking.storeId) {
      return null;
    }

    const stop = itinerary.find(
      (item): item is { storeId?: unknown; casts?: unknown } =>
        Boolean(item) &&
        typeof item === 'object' &&
        (item as { storeId?: unknown }).storeId === booking.storeId,
    );
    if (!Array.isArray(stop?.casts)) {
      return null;
    }

    const castNames = stop.casts
      .map((cast) =>
        cast &&
        typeof cast === 'object' &&
        typeof (cast as { name?: unknown }).name === 'string'
          ? (cast as { name: string }).name.trim()
          : '',
      )
      .filter(Boolean);

    return castNames.length ? castNames.join(', ') : null;
  }

  private customerName(input: {
    user?: { displayName?: string | null } | null;
    guest?: { displayName?: string | null } | null;
  }) {
    return input.user?.displayName ?? input.guest?.displayName ?? 'Khách mới';
  }

  private customerEmail(input: {
    user?: { email?: string | null } | null;
    guest?: { email?: string | null } | null;
  }) {
    return input.guest?.email ?? input.user?.email ?? null;
  }

  private customerType(input: { user?: { tier?: string | null } | null }) {
    if (!input.user) {
      return 'Guest';
    }

    if (input.user.tier === 'VIP' || input.user.tier === 'PREMIUM') {
      return 'VIP';
    }
    if (input.user.tier === 'MEMBER' || input.user.tier === 'FREE') {
      return 'Member';
    }
    return 'Guest';
  }

  private bookingDiscountLabel(input: {
    user?: { tier?: string | null } | null;
    discountSnapshot?: unknown;
    coupon?: {
      discountType?: string | null;
      discountValue?: number | null;
    } | null;
  }) {
    if (input.coupon) {
      const type = input.coupon.discountType;
      const value = input.coupon.discountValue;
      if (typeof value === 'number' && value > 0) {
        if (type === 'PERCENT') {
          return `${value}%`;
        }
        if (type === 'FIXED_AMOUNT') {
          return value >= 1000 ? `${value / 1000}K` : `${value} VND`;
        }
      }
    }

    if (input.discountSnapshot && typeof input.discountSnapshot === 'object') {
      const record = input.discountSnapshot as Record<string, unknown>;
      const type = record.discountType || record.type;
      const value = record.discountPercent ?? record.value;
      if (typeof value === 'number' && value > 0) {
        if (type === 'PERCENT' || !type) {
          return `${value}%`;
        }
        if (type === 'FIXED_AMOUNT') {
          return value >= 1000 ? `${value / 1000}K` : `${value} VND`;
        }
      }
    }

    const customerType = this.customerType(input);

    if (customerType === 'VIP') {
      return '10%';
    }

    return customerType === 'Member' ? '8%' : '5%';
  }

  private discountPercentFromSnapshot(snapshot: unknown) {
    if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
      return null;
    }

    const record = snapshot as Record<string, unknown>;
    const value = record.discountPercent ?? record.value;

    return typeof value === 'number' ? value : null;
  }

  private bookingQrStatus() {
    return 'Đã cấp - Còn hiệu lực';
  }

  private bookingStatusLabel(status?: string | null) {
    if (status === 'COMPLETED' || status === 'CHECKED_IN') {
      return 'Hoàn tất';
    }

    if (status === 'CANCELLED' || status === 'NO_SHOW') {
      return 'Đã hủy';
    }

    return 'Mới';
  }

  private customerContact(input: {
    guest?: { phone?: string | null; email?: string | null } | null;
  }) {
    return input.guest?.phone ?? input.guest?.email ?? null;
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

    if (typeof value === 'object') {
      return JSON.stringify(value) ?? '';
    }

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      typeof value === 'bigint'
    ) {
      return String(value);
    }

    return '';
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

  private telegramNotificationTimeZone() {
    return this.configService.get<string>(
      'TELEGRAM_NOTIFICATION_TIME_ZONE',
      'Asia/Bangkok',
    );
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

  private toValidDate(value?: Date | string | null) {
    if (!value) {
      return null;
    }

    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
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
