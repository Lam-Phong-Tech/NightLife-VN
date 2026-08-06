import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { RolesGuard } from '../src/auth/roles.guard';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { RbacController } from '../src/rbac/rbac.controller';
import { RbacService } from '../src/rbac/rbac.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuditLogsService } from '../src/audit-logs/audit-logs.service';

class TestJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      user?: { id: string; role: string };
    }>();
    const role = request.headers['x-test-role'] as string;

    if (!role) {
      throw new UnauthorizedException();
    }

    request.user = {
      id: (request.headers['x-test-user-id'] as string) ?? 'user-1',
      role,
    };

    return true;
  }
}

describe('RBAC Service (e2e)', () => {
  let app: INestApplication;
  const mockPrismaService = {
    role: { findMany: jest.fn(), findFirst: jest.fn() },
    permission: { findMany: jest.fn() },
    rolePermission: { findMany: jest.fn(), count: jest.fn(), deleteMany: jest.fn(), upsert: jest.fn() },
    auditLog: { create: jest.fn() },
    $transaction: jest.fn(async (cb) => cb(mockPrismaService)),
  };
  const mockAuditLogsService = {};

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [RbacController],
      providers: [
        RolesGuard,
        RbacService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuditLogsService, useValue: mockAuditLogsService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(TestJwtGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /admin/rbac/matrix', () => {
    it('returns 200 with correct shape for ADMIN', async () => {
      mockPrismaService.role.findMany.mockResolvedValue([{ id: 'r1', key: 'admin' }]);
      mockPrismaService.permission.findMany.mockResolvedValue([{ id: 'p1', key: 'store.admin.view' }]);
      mockPrismaService.rolePermission.findMany.mockResolvedValue([
        { role: { key: 'admin' }, permission: { key: 'store.admin.view' } },
      ]);
      mockPrismaService.rolePermission.count.mockResolvedValue(1);

      const response = await request(app.getHttpServer())
        .get('/admin/rbac/matrix')
        .set('x-test-role', 'ADMIN')
        .expect(200);

      expect(response.body).toEqual({
        roles: [{ id: 'r1', key: 'admin' }],
        permissions: [{ id: 'p1', key: 'store.admin.view' }],
        assignments: { admin: ['store.admin.view'] },
        version: 1,
      });
    });

    it('returns 403 for OPERATOR', async () => {
      await request(app.getHttpServer())
        .get('/admin/rbac/matrix')
        .set('x-test-role', 'OPERATOR')
        .expect(403);
    });
  });

  describe('PUT /admin/rbac/roles/:roleKey/permissions', () => {
    beforeEach(() => {
      mockPrismaService.rolePermission.count.mockResolvedValue(10);
      mockPrismaService.role.findFirst.mockResolvedValue({ id: 'r1', key: 'operator', status: 'ACTIVE' });
      mockPrismaService.permission.findMany.mockResolvedValue([{ id: 'p1', key: 'store.admin.view' }]);
      mockPrismaService.rolePermission.findMany.mockResolvedValue([]);
    });

    it('returns 200 for ADMIN modifying operator', async () => {
      await request(app.getHttpServer())
        .put('/admin/rbac/roles/operator/permissions')
        .set('x-test-role', 'ADMIN')
        .send({ permissionKeys: ['store.admin.view'], version: 10 })
        .expect(200);
    });

    it('returns 403 for ADMIN modifying admin', async () => {
      mockPrismaService.role.findFirst.mockResolvedValue({ id: 'r2', key: 'admin', status: 'ACTIVE' });
      await request(app.getHttpServer())
        .put('/admin/rbac/roles/admin/permissions')
        .set('x-test-role', 'ADMIN')
        .send({ permissionKeys: ['store.admin.view'], version: 10 })
        .expect(403);
    });

    it('returns 403 for ADMIN modifying super_admin', async () => {
      await request(app.getHttpServer())
        .put('/admin/rbac/roles/super_admin/permissions')
        .set('x-test-role', 'ADMIN')
        .send({ permissionKeys: ['store.admin.view'], version: 10 })
        .expect(403);
    });

    it('returns 200 for SUPER_ADMIN modifying operator', async () => {
      await request(app.getHttpServer())
        .put('/admin/rbac/roles/operator/permissions')
        .set('x-test-role', 'SUPER_ADMIN')
        .send({ permissionKeys: ['store.admin.view'], version: 10 })
        .expect(200);
    });

    it('returns 200 for SUPER_ADMIN modifying admin', async () => {
      mockPrismaService.role.findFirst.mockResolvedValue({ id: 'r2', key: 'admin', status: 'ACTIVE' });
      await request(app.getHttpServer())
        .put('/admin/rbac/roles/admin/permissions')
        .set('x-test-role', 'SUPER_ADMIN')
        .send({ permissionKeys: ['store.admin.view'], version: 10 })
        .expect(200);
    });

    it('returns 400 for invalid permissionKey', async () => {
      mockPrismaService.permission.findMany.mockResolvedValue([]); // not found
      await request(app.getHttpServer())
        .put('/admin/rbac/roles/operator/permissions')
        .set('x-test-role', 'ADMIN')
        .send({ permissionKeys: ['invalid.perm'], version: 10 })
        .expect(400);
    });
  });
});
