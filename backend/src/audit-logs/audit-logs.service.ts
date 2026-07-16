import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

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
      ...(module ? { module } : {}),
      ...(action ? { action } : {}),
      ...(result ? { result } : {}),
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
    const log = await this.prisma.auditLog.findUnique({
      where: { id },
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
