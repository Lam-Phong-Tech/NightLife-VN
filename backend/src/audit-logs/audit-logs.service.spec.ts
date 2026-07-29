import { NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuditLogsService } from './audit-logs.service';

describe('AuditLogsService', () => {
  const findMany = jest.fn();
  const count = jest.fn();
  const findFirst = jest.fn();
  const findManyStores = jest.fn();
  const findManyCasts = jest.fn();
  const prisma = {
    auditLog: { findMany, count, findFirst },
    store: { findMany: findManyStores },
    cast: { findMany: findManyCasts },
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
        expect.objectContaining({
          AND: expect.arrayContaining([
            { actorType: null },
            { actorRole: null },
            expect.objectContaining({ action: expect.any(Object) }),
          ]),
        }),
        {
          AND: [
            { action: 'BOOKING_CANCELLED' },
            {
              metadata: {
                path: ['actorType'],
                equals: 'ADMIN',
              },
            },
          ],
        },
      ],
    };
    const where = {
      AND: [
        scope,
        {
          OR: [
            { module: { equals: 'Store', mode: 'insensitive' } },
            {
              AND: [
                { module: null },
                {
                  targetType: { equals: 'Store', mode: 'insensitive' },
                },
              ],
            },
          ],
          result: 'SUCCESS',
        },
      ],
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

  it('adds friendly target names to existing ranking snapshots', async () => {
    findMany.mockResolvedValue([
      {
        id: 'ranking-log-id',
        action: 'ranking.config.update',
        actorName: 'admin@example.com',
        actorRole: UserRole.ADMIN,
        actor: null,
        beforeJson: {
          targetType: 'STORE',
          targetId: 'store-id',
          pinRank: 4,
        },
        afterJson: {
          targetType: 'STORE',
          targetId: 'store-id',
          pinRank: 2,
        },
      },
    ]);
    count.mockResolvedValue(1);
    findManyStores.mockResolvedValue([
      { id: 'store-id', name: 'Lighthouse Club' },
    ]);

    const result = await service.getAuditLogs({ page: 1, limit: 20 });

    expect(findManyStores).toHaveBeenCalledWith({
      where: { id: { in: ['store-id'] } },
      select: { id: true, name: true },
    });
    expect(result.items[0]).toEqual(
      expect.objectContaining({
        beforeJson: expect.objectContaining({
          targetName: 'Lighthouse Club',
          pinRank: 4,
        }),
        afterJson: expect.objectContaining({
          targetName: 'Lighthouse Club',
          pinRank: 2,
        }),
      }),
    );
  });
});
