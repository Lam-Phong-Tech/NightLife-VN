import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
  ForbiddenException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { UsersController } from '../src/users/users.controller';
import { UsersService } from '../src/users/users.service';
import { PartnerStaffController } from '../src/partner-staff/partner-staff.controller';
import { PartnerStaffService } from '../src/partner-staff/partner-staff.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { PasswordService } from '../src/common/password.service';
import { AccessService } from '../src/access/access.service';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { RolesGuard } from '../src/auth/roles.guard';

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
      id: firstHeaderValue(req.headers['x-test-user-id']) ?? 'user-1',
      role,
    };

    return true;
  }
}

function firstHeaderValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

describe('Challenger Settings Verification (e2e)', () => {
  let app: INestApplication;

  const prisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    storePermission: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const passwordService = {
    verify: jest.fn(),
    hash: jest.fn(),
  };

  const accessService = {
    ensureStoreAccess: jest.fn(),
  };

  const partnerStaffService = {
    assignStaffToStore: jest.fn(),
    removeStaffFromStore: jest.fn(),
  };

  const usersService = {
    findByIdOrThrow: jest.fn(),
    toPublicUser: jest.fn(),
    changePassword: jest.fn(),
    updatePassword: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsersController, PartnerStaffController],
      providers: [
        { provide: PrismaService, useValue: prisma },
        { provide: PasswordService, useValue: passwordService },
        { provide: AccessService, useValue: accessService },
        { provide: PartnerStaffService, useValue: partnerStaffService },
        { provide: UsersService, useValue: usersService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(TestJwtGuard)
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
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
    await app.close();
  });

  describe('Password Change', () => {
    it('returns 400 Bad Request when oldPassword or newPassword is empty', async () => {
      // Empty oldPassword
      await request(app.getHttpServer())
        .post('/users/change-password')
        .set('x-test-role', 'USER')
        .set('x-test-user-id', 'user-1')
        .send({ oldPassword: '', newPassword: 'NewPassword123!' })
        .expect(400);

      // Empty newPassword
      await request(app.getHttpServer())
        .post('/users/change-password')
        .set('x-test-role', 'USER')
        .set('x-test-user-id', 'user-1')
        .send({ oldPassword: 'OldPassword123!', newPassword: '' })
        .expect(400);
    });

    it('returns 400 Bad Request when newPassword is less than 8 characters', async () => {
      await request(app.getHttpServer())
        .post('/users/change-password')
        .set('x-test-role', 'USER')
        .set('x-test-user-id', 'user-1')
        .send({ oldPassword: 'OldPassword123!', newPassword: 'short' })
        .expect(400);
    });

    it('returns 401 Unauthorized when incorrect old password is provided', async () => {
      usersService.changePassword.mockRejectedValue(
        new UnauthorizedException('Mật khẩu cũ không chính xác'),
      );

      const response = await request(app.getHttpServer())
        .post('/users/change-password')
        .set('x-test-role', 'USER')
        .set('x-test-user-id', 'user-1')
        .send({ oldPassword: 'WrongOldPassword', newPassword: 'NewPassword123!' })
        .expect(401);

      expect(response.body.message).toContain('Mật khẩu cũ không chính xác');
    });

    it('returns 201 Created and calls changePassword when credentials are valid', async () => {
      usersService.changePassword.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .post('/users/change-password')
        .set('x-test-role', 'USER')
        .set('x-test-user-id', 'user-1')
        .send({ oldPassword: 'OldPassword123!', newPassword: 'NewPassword123!' })
        .expect(201);

      expect(usersService.changePassword).toHaveBeenCalledWith('user-1', {
        oldPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
      });
    });
  });

  describe('Staff Creation', () => {
    it('returns 403 Forbidden when creating staff for a non-owned/unauthorized store', async () => {
      accessService.ensureStoreAccess.mockRejectedValue(
        new ForbiddenException('You cannot access data for this store'),
      );

      await request(app.getHttpServer())
        .post('/partner/staff')
        .set('x-test-role', 'PARTNER')
        .set('x-test-user-id', 'partner-1')
        .send({
          storeId: 'non-owned-store-id',
          email: 'newstaff@example.com',
          password: 'password123',
          displayName: 'Staff Name',
        })
        .expect(403);

      expect(accessService.ensureStoreAccess).toHaveBeenCalledWith(
        { id: 'partner-1', role: 'PARTNER' },
        'non-owned-store-id',
      );
      expect(partnerStaffService.assignStaffToStore).not.toHaveBeenCalled();
    });

    it('returns 201 Created and creates staff when store is owned/authorized', async () => {
      accessService.ensureStoreAccess.mockResolvedValue(undefined);
      partnerStaffService.assignStaffToStore.mockResolvedValue({
        userId: 'new-staff-id',
        email: 'newstaff@example.com',
        displayName: 'Staff Name',
        status: 'ACTIVE',
      });

      const response = await request(app.getHttpServer())
        .post('/partner/staff')
        .set('x-test-role', 'PARTNER')
        .set('x-test-user-id', 'partner-1')
        .send({
          storeId: 'owned-store-id',
          email: 'newstaff@example.com',
          password: 'password123',
          displayName: 'Staff Name',
        })
        .expect(201);

      expect(accessService.ensureStoreAccess).toHaveBeenCalledWith(
        { id: 'partner-1', role: 'PARTNER' },
        'owned-store-id',
      );
      expect(partnerStaffService.assignStaffToStore).toHaveBeenCalled();
      expect(response.body.userId).toBe('new-staff-id');
    });
  });

  describe('Staff Deletion', () => {
    it('returns 400 Bad Request when storeId query parameter is missing', async () => {
      await request(app.getHttpServer())
        .delete('/partner/staff/staff-id-123')
        .set('x-test-role', 'PARTNER')
        .set('x-test-user-id', 'partner-1')
        .expect(400);

      expect(accessService.ensureStoreAccess).not.toHaveBeenCalled();
      expect(partnerStaffService.removeStaffFromStore).not.toHaveBeenCalled();
    });

    it('returns 403 Forbidden when deleting staff from a non-owned/unauthorized store', async () => {
      accessService.ensureStoreAccess.mockRejectedValue(
        new ForbiddenException('You cannot access data for this store'),
      );

      await request(app.getHttpServer())
        .delete('/partner/staff/staff-id-123?storeId=non-owned-store-id')
        .set('x-test-role', 'PARTNER')
        .set('x-test-user-id', 'partner-1')
        .expect(403);

      expect(accessService.ensureStoreAccess).toHaveBeenCalledWith(
        { id: 'partner-1', role: 'PARTNER' },
        'non-owned-store-id',
      );
      expect(partnerStaffService.removeStaffFromStore).not.toHaveBeenCalled();
    });

    it('returns 200 OK and deletes staff when store is owned/authorized', async () => {
      accessService.ensureStoreAccess.mockResolvedValue(undefined);
      partnerStaffService.removeStaffFromStore.mockResolvedValue({ success: true });

      const response = await request(app.getHttpServer())
        .delete('/partner/staff/staff-id-123?storeId=owned-store-id')
        .set('x-test-role', 'PARTNER')
        .set('x-test-user-id', 'partner-1')
        .expect(200);

      expect(accessService.ensureStoreAccess).toHaveBeenCalledWith(
        { id: 'partner-1', role: 'PARTNER' },
        'owned-store-id',
      );
      expect(partnerStaffService.removeStaffFromStore).toHaveBeenCalledWith(
        'staff-id-123',
        'owned-store-id',
      );
      expect(response.body.success).toBe(true);
    });
  });
});
