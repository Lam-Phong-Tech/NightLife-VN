import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, UserRole } from '@prisma/client';

const ADMIN_AUDIT_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.OPERATOR,
];

const LEGACY_ADMIN_AUDIT_ACTIONS = [
  'BOOKING_RESCHEDULE_APPROVED',
  'BOOKING_RESCHEDULE_REJECTED',
  'BOOKING_POLICY_UPDATED',
  'BOOKING_STATUS_CHANGED',
  'COUPON_QR_TOKEN_REVOKED',
  'COUPON_QR_TOKEN_ROTATED',
  'PARTNER_REQUEST_APPROVED',
  'PARTNER_REQUEST_REJECTED',
  'bill.review.pending_pm_ba',
  'bill.review.approve',
  'bill.review.reject',
  'bill.review.void',
  'bill.reversal',
  'bill.fraud.auto_reversal',
] as const;

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  private auditSnapshot(value: Prisma.JsonValue | null) {
    if (!value || Array.isArray(value) || typeof value !== 'object') {
      return null;
    }
    return value as Record<string, Prisma.JsonValue>;
  }

  private async resolveRankingTargetNames(
    logs: Array<{
      action: string;
      beforeJson: Prisma.JsonValue | null;
      afterJson: Prisma.JsonValue | null;
    }>,
  ) {
    const storeIds = new Set<string>();
    const castIds = new Set<string>();

    for (const log of logs) {
      if (
        typeof log.action !== 'string' ||
        !log.action.startsWith('ranking.config.')
      ) {
        continue;
      }

      for (const value of [log.beforeJson, log.afterJson]) {
        const snapshot = this.auditSnapshot(value);
        const targetId =
          typeof snapshot?.targetId === 'string' ? snapshot.targetId : null;
        const targetType =
          typeof snapshot?.targetType === 'string'
            ? snapshot.targetType.toUpperCase()
            : null;

        if (!targetId) continue;
        if (targetType === 'STORE') storeIds.add(targetId);
        if (targetType === 'CAST') castIds.add(targetId);
      }
    }

    const storeLookup: Promise<Array<{ id: string; name: string }>> =
      storeIds.size
        ? this.prisma.store.findMany({
            where: { id: { in: [...storeIds] } },
            select: { id: true, name: true },
          })
        : Promise.resolve([]);
    const castLookup: Promise<
      Array<{ id: string; stageName: string; publicAlias: string | null }>
    > = castIds.size
      ? this.prisma.cast.findMany({
          where: { id: { in: [...castIds] } },
          select: { id: true, stageName: true, publicAlias: true },
        })
      : Promise.resolve([]);

    const [stores, casts] = await Promise.all([storeLookup, castLookup]);

    return new Map<string, string>([
      ...stores.map(
        (store) => [`STORE:${store.id}`, store.name] as [string, string],
      ),
      ...casts.map(
        (cast) =>
          [`CAST:${cast.id}`, cast.publicAlias || cast.stageName] as [
            string,
            string,
          ],
      ),
    ]);
  }

  private enrichRankingSnapshot(
    value: Prisma.JsonValue | null,
    targetNames: Map<string, string>,
  ): Prisma.JsonValue | null {
    const snapshot = this.auditSnapshot(value);
    if (!snapshot) return value;

    const targetId =
      typeof snapshot.targetId === 'string' ? snapshot.targetId : null;
    const targetType =
      typeof snapshot.targetType === 'string'
        ? snapshot.targetType.toUpperCase()
        : null;
    const targetName =
      targetId && targetType
        ? targetNames.get(`${targetType}:${targetId}`)
        : undefined;

    return targetName ? { ...snapshot, targetName } : value;
  }

  private adminAuditScope(): Prisma.AuditLogWhereInput {
    return {
      OR: [
        { actorType: { equals: 'ADMIN', mode: 'insensitive' } },
        { actorRole: { in: ADMIN_AUDIT_ROLES } },
        {
          AND: [
            { actorType: null },
            { actorRole: null },
            { action: { in: [...LEGACY_ADMIN_AUDIT_ACTIONS] } },
          ],
        },
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
    const requestedFilters: Prisma.AuditLogWhereInput = {
      ...(action ? { action } : {}),
      ...(result ? { result } : {}),
      ...(module
        ? {
            OR: [
              { module: { equals: module, mode: 'insensitive' } },
              {
                AND: [
                  { module: null },
                  { targetType: { equals: module, mode: 'insensitive' } },
                ],
              },
            ],
          }
        : {}),
    };

    const where: Prisma.AuditLogWhereInput = {
      AND: [this.adminAuditScope(), requestedFilters],
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

    const rankingTargetNames = await this.resolveRankingTargetNames(items);
    const mappedItems = items.map((item) => ({
      ...item,
      beforeJson: this.enrichRankingSnapshot(
        item.beforeJson,
        rankingTargetNames,
      ),
      afterJson: this.enrichRankingSnapshot(item.afterJson, rankingTargetNames),
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
    const rankingTargetNames = await this.resolveRankingTargetNames([log]);
    return {
      ...log,
      beforeJson: this.enrichRankingSnapshot(
        log.beforeJson,
        rankingTargetNames,
      ),
      afterJson: this.enrichRankingSnapshot(log.afterJson, rankingTargetNames),
      actorName:
        log.actorName ||
        log.actor?.displayName ||
        log.actor?.email ||
        undefined,
      actorRole: log.actorRole || log.actor?.role || undefined,
    };
  }
}
