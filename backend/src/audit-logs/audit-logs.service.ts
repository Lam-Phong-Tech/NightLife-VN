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
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items,
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
    });
    if (!log) {
      throw new NotFoundException('Audit log not found');
    }
    return log;
  }
}
