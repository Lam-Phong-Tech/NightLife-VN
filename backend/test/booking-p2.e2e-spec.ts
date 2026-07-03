import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AccessService } from '../src/access/access.service';
import { ActionPolicyGuard } from '../src/access/action-policy.guard';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { RolesGuard } from '../src/auth/roles.guard';
import { NightlifeDataController } from '../src/nightlife-data/nightlife-data.controller';
import { NightlifeDataService } from '../src/nightlife-data/nightlife-data.service';
import { AdminNotificationService } from '../src/notifications/admin-notification.service';
import { PrismaService } from '../src/prisma/prisma.service';

class TestJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      user?: { id: string; role: string };
    }>();
    const role = firstHeaderValue(req.headers['x-test-role']);

    if (!role) {
      throw new UnauthorizedException();
    }

    req.user = {
      id: firstHeaderValue(req.headers['x-test-user-id']) ?? 'member-1',
      role,
    };

    return true;
  }
}

function firstHeaderValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

describe('Booking P2 workflows API (e2e)', () => {
  let app: INestApplication;

  const prisma = {
    booking: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    bookingChangeRequest: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    bookingChatMessage: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    store: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    notificationLog: {
      create: jest.fn(),
    },
  };
  const accessService = {
    canViewMemberBooking: jest.fn(),
    getAccessibleStoreIds: jest.fn(),
    ensureStoreAccess: jest.fn(),
  };
  const adminNotificationService = {
    notifyBookingCreated: jest.fn(),
    notifyBookingCancelled: jest.fn(),
    notifyBillSubmitted: jest.fn(),
    notifyBillReviewed: jest.fn(),
    notifyPartnerRequest: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2026-07-01T12:00:00.000Z'));
    accessService.canViewMemberBooking.mockResolvedValue(true);
    accessService.getAccessibleStoreIds.mockResolvedValue(undefined);
    accessService.ensureStoreAccess.mockResolvedValue(undefined);
    prisma.auditLog.create.mockResolvedValue({ id: 'audit-1' });
    prisma.notificationLog.create.mockResolvedValue({ id: 'notification-1' });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [NightlifeDataController],
      providers: [
        Reflector,
        RolesGuard,
        ActionPolicyGuard,
        NightlifeDataService,
        { provide: PrismaService, useValue: prisma },
        { provide: AccessService, useValue: accessService },
        { provide: AdminNotificationService, useValue: adminNotificationService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(TestJwtGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        forbidNonWhitelisted: true,
        transform: true,
        whitelist: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    jest.useRealTimers();
    await app.close();
  });

  it('lets a member request reschedule as a separate workflow status', async () => {
    prisma.booking.findFirst.mockResolvedValue(openBooking());
    prisma.bookingChangeRequest.findFirst.mockResolvedValue(null);
    prisma.bookingChangeRequest.create.mockResolvedValue(changeRequest());

    await request(app.getHttpServer())
      .post('/member/bookings/booking-1/reschedule')
      .set('x-test-role', 'USER')
      .set('x-test-user-id', 'member-1')
      .send({
        scheduledAt: '2026-07-10T20:00:00.000Z',
        reason: 'Move to Friday night',
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({
            id: 'change-1',
            bookingId: 'booking-1',
            status: 'REQUESTED',
          }),
        );
      });

    expect(prisma.bookingChangeRequest.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        bookingId: 'booking-1',
        status: 'REQUESTED',
        requestedById: 'member-1',
        requestedScheduledAt: new Date('2026-07-10T20:00:00.000Z'),
      }),
      select: expect.any(Object),
    });
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'BOOKING_RESCHEDULE_REQUESTED',
        targetType: 'BookingChangeRequest',
      }),
    });
    expect(prisma.notificationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        recipient: 'ADMIN',
        templateKey: 'admin.booking.reschedule_requested.v1',
      }),
    });
  });

  it('enforces per-store 120 minute cutoff for member cancellation', async () => {
    prisma.booking.findFirst.mockResolvedValue(
      openBooking({
        scheduledAt: new Date('2026-07-01T13:30:00.000Z'),
        store: { bookingCancelCutoffMinutes: 120 },
      }),
    );

    await request(app.getHttpServer())
      .patch('/member/bookings/booking-1/cancel')
      .set('x-test-role', 'USER')
      .set('x-test-user-id', 'member-1')
      .send({ reason: 'Too close to booking time' })
      .expect(422)
      .expect(({ body }) => {
        expect(body.message).toContain('120 minutes');
      });

    expect(prisma.booking.update).not.toHaveBeenCalled();
    expect(prisma.auditLog.create).not.toHaveBeenCalled();
  });

  it('lets admin approve a reschedule request and updates booking time', async () => {
    prisma.bookingChangeRequest.findUnique.mockResolvedValue(changeRequest());
    prisma.booking.update.mockResolvedValue(
      bookingNotification({ scheduledAt: new Date('2026-07-10T20:00:00.000Z') }),
    );
    prisma.bookingChangeRequest.update.mockResolvedValue(
      changeRequest({ status: 'APPROVED', reviewedById: 'admin-1' }),
    );

    await request(app.getHttpServer())
      .patch('/admin/booking-change-requests/change-1/review')
      .set('x-test-role', 'ADMIN')
      .set('x-test-user-id', 'admin-1')
      .send({ approve: true, note: 'Confirmed with store' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.status).toBe('APPROVED');
      });

    expect(prisma.booking.update).toHaveBeenCalledWith({
      where: { id: 'booking-1' },
      data: { scheduledAt: new Date('2026-07-10T20:00:00.000Z') },
      select: expect.any(Object),
    });
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: 'admin-1',
        action: 'BOOKING_RESCHEDULE_APPROVED',
      }),
    });
    expect(prisma.notificationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        recipient: 'member-1',
        templateKey: 'customer.booking.rescheduled.v1',
      }),
    });
  });

  it('stores and exposes booking chat messages for admin/customer realtime flow', async () => {
    prisma.booking.findFirst.mockResolvedValue(openBooking());
    prisma.bookingChatMessage.create.mockResolvedValue(chatMessage());

    await request(app.getHttpServer())
      .post('/admin/bookings/booking-1/messages')
      .set('x-test-role', 'ADMIN')
      .set('x-test-user-id', 'admin-1')
      .send({ message: 'We can move you to 20:00.', topic: 'RESCHEDULE' })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({
            bookingId: 'booking-1',
            senderType: 'ADMIN',
            topic: 'RESCHEDULE',
          }),
        );
      });

    expect(accessService.ensureStoreAccess).toHaveBeenCalledWith(
      { id: 'admin-1', role: 'ADMIN' },
      'store-1',
      'booking.chat',
    );
    expect(prisma.bookingChatMessage.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        bookingId: 'booking-1',
        senderUserId: 'admin-1',
        senderType: 'ADMIN',
        body: 'We can move you to 20:00.',
      }),
      select: expect.any(Object),
    });
    expect(prisma.notificationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        bookingId: 'booking-1',
        templateKey: 'customer.booking.chat_message.v1',
      }),
    });
  });

  it('updates per-store booking cutoff policy', async () => {
    prisma.store.findFirst.mockResolvedValue({
      id: 'store-1',
      name: 'Neon Club',
      slug: 'neon-club',
      bookingCancelCutoffMinutes: 60,
    });
    prisma.store.update.mockResolvedValue({
      id: 'store-1',
      name: 'Neon Club',
      slug: 'neon-club',
      bookingCancelCutoffMinutes: 120,
    });

    await request(app.getHttpServer())
      .patch('/admin/stores/store-1/booking-policy')
      .set('x-test-role', 'ADMIN')
      .set('x-test-user-id', 'admin-1')
      .send({ cancelCutoffMinutes: 120 })
      .expect(200)
      .expect(({ body }) => {
        expect(body.bookingCancelCutoffMinutes).toBe(120);
      });

    expect(prisma.store.update).toHaveBeenCalledWith({
      where: { id: 'store-1' },
      data: { bookingCancelCutoffMinutes: 120 },
      select: expect.any(Object),
    });
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'BOOKING_POLICY_UPDATED',
        targetType: 'Store',
      }),
    });
  });

  it('returns cancel-rate dashboard grouped by store, cast, and channel', async () => {
    prisma.booking.findMany.mockResolvedValue([
      analyticsBooking({ id: 'booking-1', status: 'CANCELLED', userId: 'member-1' }),
      analyticsBooking({ id: 'booking-2', status: 'REQUESTED', userId: null }),
    ]);

    await request(app.getHttpServer())
      .get('/admin/bookings/cancel-analytics?days=30')
      .set('x-test-role', 'ADMIN')
      .set('x-test-user-id', 'admin-1')
      .expect(200)
      .expect(({ body }) => {
        expect(body.meta).toEqual(
          expect.objectContaining({
            totalBookings: 2,
            cancelledBookings: 1,
            cancelRate: 50,
          }),
        );
        expect(body.byStore[0]).toEqual(
          expect.objectContaining({
            storeId: 'store-1',
            totalBookings: 2,
            cancelledBookings: 1,
          }),
        );
        expect(body.byChannel).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ channel: 'MEMBER' }),
            expect.objectContaining({ channel: 'GUEST' }),
          ]),
        );
      });
  });
});

function openBooking(overrides: Record<string, unknown> = {}) {
  return {
    id: 'booking-1',
    storeId: 'store-1',
    castId: 'cast-1',
    userId: 'member-1',
    guestId: 'guest-1',
    status: 'REQUESTED',
    scheduledAt: new Date('2026-07-10T19:00:00.000Z'),
    cancelledAt: null,
    store: { bookingCancelCutoffMinutes: 60 },
    ...overrides,
  };
}

function bookingNotification(overrides: Record<string, unknown> = {}) {
  return {
    id: 'booking-1',
    storeId: 'store-1',
    castId: 'cast-1',
    status: 'REQUESTED',
    scheduledAt: new Date('2026-07-10T19:00:00.000Z'),
    partySize: 2,
    subtotalVnd: 0,
    discountVnd: 0,
    totalVnd: 0,
    note: null,
    cancelledAt: null,
    createdAt: new Date('2026-07-01T12:00:00.000Z'),
    store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
    cast: {
      id: 'cast-1',
      slug: 'yuna-neon',
      stageName: 'Yuna',
      publicAlias: 'Yuna',
    },
    user: { id: 'member-1', displayName: 'Member One', tier: 'FREE' },
    guest: { id: 'guest-1', displayName: 'Member One', phone: '+84901234567' },
    ...overrides,
  };
}

function changeRequest(overrides: Record<string, unknown> = {}) {
  return {
    id: 'change-1',
    bookingId: 'booking-1',
    storeId: 'store-1',
    castId: 'cast-1',
    requestedById: 'member-1',
    guestId: 'guest-1',
    reviewedById: null,
    type: 'RESCHEDULE',
    status: 'REQUESTED',
    currentScheduledAt: new Date('2026-07-10T19:00:00.000Z'),
    requestedScheduledAt: new Date('2026-07-10T20:00:00.000Z'),
    reason: 'Move to Friday night',
    adminNote: null,
    reviewedAt: null,
    createdAt: new Date('2026-07-01T12:00:00.000Z'),
    updatedAt: new Date('2026-07-01T12:00:00.000Z'),
    booking: bookingNotification(),
    store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
    cast: {
      id: 'cast-1',
      slug: 'yuna-neon',
      stageName: 'Yuna',
      publicAlias: 'Yuna',
    },
    requestedBy: { id: 'member-1', displayName: 'Member One' },
    guest: { id: 'guest-1', displayName: 'Member One', phone: '+84901234567' },
    reviewedBy: null,
    ...overrides,
  };
}

function chatMessage(overrides: Record<string, unknown> = {}) {
  return {
    id: 'message-1',
    bookingId: 'booking-1',
    changeRequestId: null,
    storeId: 'store-1',
    senderUserId: 'admin-1',
    guestId: 'guest-1',
    senderType: 'ADMIN',
    topic: 'RESCHEDULE',
    body: 'We can move you to 20:00.',
    createdAt: new Date('2026-07-01T12:00:00.000Z'),
    senderUser: { id: 'admin-1', displayName: 'Admin One', role: 'ADMIN' },
    guest: { id: 'guest-1', displayName: 'Member One', phone: '+84901234567' },
    ...overrides,
  };
}

function analyticsBooking(overrides: Record<string, unknown> = {}) {
  return {
    id: 'booking-analytics',
    status: 'REQUESTED',
    storeId: 'store-1',
    castId: 'cast-1',
    userId: 'member-1',
    guestId: 'guest-1',
    createdAt: new Date('2026-07-01T12:00:00.000Z'),
    cancelledAt: null,
    store: {
      id: 'store-1',
      name: 'Neon Club',
      slug: 'neon-club',
      bookingCancelCutoffMinutes: 60,
    },
    cast: {
      id: 'cast-1',
      slug: 'yuna-neon',
      stageName: 'Yuna',
      publicAlias: 'Yuna',
    },
    ...overrides,
  };
}
