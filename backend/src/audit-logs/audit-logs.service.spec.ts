import { NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuditLogsService } from './audit-logs.service';

describe('AuditLogsService', () => {
  const findMany = jest.fn();
  const count = jest.fn();
  const findFirst = jest.fn();
  const prisma = {
    auditLog: { findMany, count, findFirst },
  };
  let service: AuditLogsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuditLogsService(prisma as never);
  });

  it('lists and counts only administrative audit records', async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);

    await service.getAuditLogs({
      page: 2,
      limit: 20,
      module: 'Store',
      result: 'SUCCESS',
    });

    const adminRoles = [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
      UserRole.OPERATOR,
    ];
    const scope = {
      OR: [
        { actorType: { equals: 'ADMIN', mode: 'insensitive' } },
        { actorRole: { in: adminRoles } },
        { actor: { is: { role: { in: adminRoles } } } },
      ],
    };
    const where = {
      AND: [scope, { module: 'Store', result: 'SUCCESS' }],
    };

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where, skip: 20, take: 20 }),
    );
    expect(count).toHaveBeenCalledWith({ where });
  });

  it('does not expose non-admin records through the detail endpoint', async () => {
    findFirst.mockResolvedValue(null);

    await expect(service.getAuditLogById('user-log-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [
            { id: 'user-log-id' },
            expect.objectContaining({ OR: expect.any(Array) }),
          ],
        },
      }),
    );
  });

  it('keeps actor snapshot fallbacks for an admin record', async () => {
    findFirst.mockResolvedValue({
      id: 'admin-log-id',
      actorName: null,
      actorRole: null,
      actor: {
        displayName: 'Quản trị viên',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      },
    });

    const result = await service.getAuditLogById('admin-log-id');

    expect(result).toEqual(
      expect.objectContaining({
        actorName: 'Quản trị viên',
        actorRole: UserRole.ADMIN,
      }),
    );
  });
});
