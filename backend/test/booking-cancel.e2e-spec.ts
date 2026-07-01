import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AccessService } from '../src/access/access.service';
import { ActionPolicyGuard } from '../src/access/action-policy.guard';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { RolesGuard } from '../src/auth/roles.guard';
import { NightlifeDataController } from '../src/nightlife-data/nightlife-data.controller';
import { NightlifeDataService } from '../src/nightlife-data/nightlife-data.service';
import {
  ADMIN_TELEGRAM_TEMPLATES,
  AdminNotificationService,
} from '../src/notifications/admin-notification.service';
import { PrismaService } from '../src/prisma/prisma.service';

class TestJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      user?: { id: string; role: string };
    }>();
    const role = firstHeaderValue(request.headers['x-test-role']);

    if (!role) {
      throw new UnauthorizedException();
    }

    request.user = {
      id: firstHeaderValue(request.headers['x-test-user-id']) ?? 'member-1',
      role,
    };

    return true;
  }
}

function firstHeaderValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

describe('Booking cancellation API (e2e)', () => {
  let app: INestApplication;

  const scheduledAt = new Date('2026-06-30T14:00:00.000Z');
  const cancelledAt = new Date('2026-06-30T12:30:00.000Z');
  const prisma = {
    booking: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    notificationLog: {
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  const accessService = {
    canViewMemberBooking: jest.fn(),
  };
  const configService = {
    get: jest.fn((_key: string, defaultValue?: string) => defaultValue),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2026-06-30T12:30:00.000Z'));
    accessService.canViewMemberBooking.mockResolvedValue(true);
    prisma.auditLog.create.mockResolvedValue({ id: 'audit-1' });
    prisma.notificationLog.create.mockResolvedValue({ id: 'notification-1' });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [NightlifeDataController],
      providers: [
        Reflector,
        RolesGuard,
        ActionPolicyGuard,
        NightlifeDataService,
        AdminNotificationService,
        { provide: PrismaService, useValue: prisma },
        { provide: AccessService, useValue: accessService },
        { provide: ConfigService, useValue: configService },
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

  it('lets a member cancel their own booking before the 1 hour cutoff', async () => {
    prisma.booking.findFirst.mockResolvedValue(openMemberBooking());
    prisma.booking.update.mockResolvedValue(cancelledBooking());

    const response = await request(app.getHttpServer())
      .patch('/member/bookings/booking-1/cancel')
      .set('x-test-role', 'USER')
      .set('x-test-user-id', 'member-1')
      .send({ reason: 'Change of plans' })
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({ id: 'booking-1', status: 'CANCELLED' }),
    );
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: 'member-1',
        action: 'BOOKING_CANCELLED',
        targetType: 'Booking',
        targetId: 'booking-1',
        metadata: expect.objectContaining({
          actorType: 'MEMBER',
          reason: 'Change of plans',
          beforeStatus: 'REQUESTED',
          afterStatus: 'CANCELLED',
        }),
      }),
    });
    expect(prisma.notificationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        bookingId: 'booking-1',
        templateKey: ADMIN_TELEGRAM_TEMPLATES.bookingCancelled,
      }),
    });
  });

  it('lets a guest cancel their own booking with the matching phone before the 1 hour cutoff', async () => {
    prisma.booking.findFirst.mockResolvedValue(openGuestBooking());
    prisma.booking.update.mockResolvedValue(cancelledBooking({ user: null }));

    await request(app.getHttpServer())
      .patch('/bookings/booking-1/cancel')
      .send({ phone: '+84901234567', reason: 'Wrong time' })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({ id: 'booking-1', status: 'CANCELLED' }),
        );
      });

    expect(prisma.booking.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'booking-1',
        userId: null,
        deletedAt: null,
        guest: { is: { phone: '+84901234567' } },
      },
      select: expect.objectContaining({
        id: true,
        userId: true,
        guestId: true,
        status: true,
        scheduledAt: true,
        cancelledAt: true,
      }),
    });
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: undefined,
        action: 'BOOKING_CANCELLED',
        metadata: expect.objectContaining({
          actorType: 'GUEST',
          actorId: null,
          reason: 'Wrong time',
        }),
      }),
    });
    expect(prisma.notificationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        bookingId: 'booking-1',
        templateKey: ADMIN_TELEGRAM_TEMPLATES.bookingCancelled,
      }),
    });
  });

  it('blocks member cancellation inside the 1 hour cutoff', async () => {
    prisma.booking.findFirst.mockResolvedValue({
      ...openMemberBooking(),
      scheduledAt: new Date('2026-06-30T13:10:00.000Z'),
    });

    await request(app.getHttpServer())
      .patch('/member/bookings/booking-1/cancel')
      .set('x-test-role', 'USER')
      .set('x-test-user-id', 'member-1')
      .send({ reason: 'Too late' })
      .expect(422);

    expect(prisma.booking.update).not.toHaveBeenCalled();
    expect(prisma.auditLog.create).not.toHaveBeenCalled();
    expect(prisma.notificationLog.create).not.toHaveBeenCalled();
  });

  it('returns 404 when a member cancels someone else booking', async () => {
    prisma.booking.findFirst.mockResolvedValue(null);

    await request(app.getHttpServer())
      .patch('/member/bookings/booking-1/cancel')
      .set('x-test-role', 'USER')
      .set('x-test-user-id', 'member-2')
      .send({ reason: 'Wrong account' })
      .expect(404);

    expect(prisma.booking.update).not.toHaveBeenCalled();
  });

  it('returns 401 without a token on member cancellation', async () => {
    await request(app.getHttpServer())
      .patch('/member/bookings/booking-1/cancel')
      .send({ reason: 'No token' })
      .expect(401);

    expect(prisma.booking.findFirst).not.toHaveBeenCalled();
  });

  it('returns 403 when a non-member role calls member cancellation', async () => {
    await request(app.getHttpServer())
      .patch('/member/bookings/booking-1/cancel')
      .set('x-test-role', 'PARTNER')
      .set('x-test-user-id', 'partner-1')
      .send({ reason: 'Wrong role' })
      .expect(403);

    expect(prisma.booking.findFirst).not.toHaveBeenCalled();
  });

  it.each(['COMPLETED', 'CHECKED_IN'])(
    'blocks member cancellation when booking is %s',
    async (status) => {
      prisma.booking.findFirst.mockResolvedValue({
        ...openMemberBooking(),
        status,
      });

      await request(app.getHttpServer())
        .patch('/member/bookings/booking-1/cancel')
        .set('x-test-role', 'USER')
        .set('x-test-user-id', 'member-1')
        .send({ reason: 'Invalid state' })
        .expect(422);

      expect(prisma.booking.update).not.toHaveBeenCalled();
      expect(prisma.auditLog.create).not.toHaveBeenCalled();
      expect(prisma.notificationLog.create).not.toHaveBeenCalled();
    },
  );

  function openMemberBooking() {
    return {
      id: 'booking-1',
      userId: 'member-1',
      guestId: 'guest-1',
      status: 'REQUESTED',
      scheduledAt,
      cancelledAt: null,
    };
  }

  function openGuestBooking() {
    return {
      ...openMemberBooking(),
      userId: null,
    };
  }

  function cancelledBooking(
    options: {
      user?: { id: string; displayName: string; tier: string } | null;
    } = {},
  ) {
    return {
      id: 'booking-1',
      storeId: 'store-1',
      castId: null,
      status: 'CANCELLED',
      scheduledAt,
      partySize: 2,
      subtotalVnd: 0,
      discountVnd: 0,
      totalVnd: 0,
      note: null,
      cancelledAt,
      createdAt: new Date('2026-06-29T10:00:00.000Z'),
      store: { id: 'store-1', name: 'Neon Club', slug: 'neon-club' },
      cast: null,
      user:
        options.user === undefined
          ? { id: 'member-1', displayName: 'Member One', tier: 'REGULAR' }
          : options.user,
      guest: { id: 'guest-1', displayName: 'Guest One', phone: '+84901234567' },
    };
  }
});
