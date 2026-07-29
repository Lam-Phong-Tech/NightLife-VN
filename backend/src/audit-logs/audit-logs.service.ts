import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, UserRole } from '@prisma/client';

const ADMIN_AUDIT_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.OPERATOR,
];

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  private adminAuditScope(): Prisma.AuditLogWhereInput {
    return {
      OR: [
        { actorType: { equals: 'ADMIN', mode: 'insensitive' } },
        { actorRole: { in: ADMIN_AUDIT_ROLES } },
        { actor: { is: { role: { in: ADMIN_AUDIT_ROLES } } } },
      ],
    };
  }

  async getAuditLogs(params: {
    page: number;
    limit: number;
    module?: string;
    action?: string;
    result?: string;
  }) {
    const { page, limit, module, action, result } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {
      AND: [
        this.adminAuditScope(),
        {
          ...(module ? { module } : {}),
          ...(action ? { action } : {}),
          ...(result ? { result } : {}),
        },
      ],
    };

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: {
              id: true,
              displayName: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    const mappedItems = items.map((item) => ({
      ...item,
      actorName:
        item.actorName ||
        item.actor?.displayName ||
        item.actor?.email ||
        undefined,
      actorRole: item.actorRole || item.actor?.role || undefined,
    }));

    return {
      items: mappedItems,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAuditLogById(id: string) {
    const log = await this.prisma.auditLog.findFirst({
      where: {
        AND: [{ id }, this.adminAuditScope()],
      },
      include: {
        actor: {
          select: {
            id: true,
            displayName: true,
            email: true,
            role: true,
          },
        },
      },
    });
    if (!log) {
      throw new NotFoundException('Audit log not found');
    }
    return {
      ...log,
      actorName:
        log.actorName ||
        log.actor?.displayName ||
        log.actor?.email ||
        undefined,
      actorRole: log.actorRole || log.actor?.role || undefined,
    };
  }
}
