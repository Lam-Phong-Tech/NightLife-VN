import { Test, TestingModule } from '@nestjs/testing';
import { RbacService } from './rbac.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';

describe('RbacService', () => {
  let service: RbacService;
  let prisma: jest.Mocked<PrismaService>;
  let auditLogsService: jest.Mocked<AuditLogsService>;

  beforeEach(async () => {
    const mockPrisma = {
      role: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
      permission: {
        findMany: jest.fn(),
      },
      rolePermission: {
        findMany: jest.fn(),
        count: jest.fn(),
        deleteMany: jest.fn(),
        upsert: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(mockPrisma)),
    };

    const mockAuditLogsService = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RbacService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditLogsService, useValue: mockAuditLogsService },
      ],
    }).compile();

    service = module.get<RbacService>(RbacService);
    prisma = module.get(PrismaService) as any;
    auditLogsService = module.get(AuditLogsService) as any;
  });

  describe('getMatrix', () => {
    it('should return correct shape', async () => {
      prisma.role.findMany.mockResolvedValue([{ id: 'r1', key: 'admin', name: 'Admin', level: 80 }] as any);
      prisma.permission.findMany.mockResolvedValue([{ id: 'p1', key: 'store.admin.view' }] as any);
      prisma.rolePermission.findMany.mockResolvedValue([
        { role: { key: 'admin' }, permission: { key: 'store.admin.view' } },
      ] as any);
      prisma.rolePermission.count.mockResolvedValue(1);

      const result = await service.getMatrix();
      expect(result).toEqual({
        roles: [{ id: 'r1', key: 'admin', name: 'Admin', level: 80 }],
        permissions: [{ id: 'p1', key: 'store.admin.view' }],
        assignments: { admin: ['store.admin.view'] },
        version: 1,
      });
    });
  });

  describe('updateRolePermissions', () => {
    const adminUser = { id: 'admin1', role: 'ADMIN' };
    const superAdminUser = { id: 'sa1', role: 'SUPER_ADMIN' };
    const operatorUser = { id: 'op1', role: 'OPERATOR' };

    beforeEach(() => {
      prisma.rolePermission.count.mockResolvedValue(10);
      prisma.role.findFirst.mockResolvedValue({ id: 'role1', key: 'operator', status: 'ACTIVE' } as any);
      prisma.permission.findMany.mockResolvedValue([
        { id: 'p1', key: 'store.admin.view' },
      ] as any);
      prisma.rolePermission.findMany.mockResolvedValue([]);
    });

    it('should prevent modification of super_admin', async () => {
      await expect(
        service.updateRolePermissions(superAdminUser, 'super_admin', ['store.admin.view'], 10)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to modify operator', async () => {
      await service.updateRolePermissions(adminUser, 'operator', ['store.admin.view'], 10);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should prevent admin from modifying admin', async () => {
      await expect(
        service.updateRolePermissions(adminUser, 'admin', ['store.admin.view'], 10)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should prevent operator from modifying anyone', async () => {
      await expect(
        service.updateRolePermissions(operatorUser, 'operator', ['store.admin.view'], 10)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow super_admin to modify admin', async () => {
      prisma.role.findFirst.mockResolvedValue({ id: 'role_admin', key: 'admin', status: 'ACTIVE' } as any);
      await service.updateRolePermissions(superAdminUser, 'admin', ['store.admin.view'], 10);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should detect version conflict', async () => {
      prisma.rolePermission.count.mockResolvedValue(11); // different version
      await expect(
        service.updateRolePermissions(adminUser, 'operator', ['store.admin.view'], 10)
      ).rejects.toThrow(ConflictException);
    });

    it('should reject invalid permissions', async () => {
      prisma.permission.findMany.mockResolvedValue([]); // found none
      await expect(
        service.updateRolePermissions(adminUser, 'operator', ['invalid.perm'], 10)
      ).rejects.toThrow(BadRequestException);
    });

    it('should write audit log and perform updates', async () => {
      const result = await service.updateRolePermissions(adminUser, 'operator', ['store.admin.view'], 10);
      expect(result).toEqual({ roleKey: 'operator', permissionCount: 1, version: 10 });
      expect(prisma.rolePermission.deleteMany).toHaveBeenCalled();
      expect(prisma.rolePermission.upsert).toHaveBeenCalled();
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
  });
});
