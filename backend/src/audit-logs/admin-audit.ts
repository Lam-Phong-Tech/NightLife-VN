import { Prisma } from '@prisma/client';
import { AuthenticatedUser } from '../access/access.service';

type AuditRecord = Record<string, unknown>;

export type AdminAuditLogInput = {
  actor: AuthenticatedUser;
  module: string;
  action: string;
  targetType: string;
  targetId: string;
  entityDisplayCode?: string | null;
  before?: AuditRecord | null;
  after?: AuditRecord | null;
  changedFields?: string[];
  changeSummary: string;
  reason?: string | null;
  result?: 'SUCCESS' | 'FAILED';
  metadata?: AuditRecord | null;
};

const jsonValue = (
  value: AuditRecord | null | undefined,
): Prisma.InputJsonValue | Prisma.NullTypes.JsonNull => {
  if (value == null) {
    return Prisma.JsonNull;
  }

  return JSON.parse(
    JSON.stringify(value, (_key, item: unknown) =>
      typeof item === 'bigint' ? item.toString() : item,
    ),
  ) as Prisma.InputJsonValue;
};

export const adminAuditActorFields = (actor: AuthenticatedUser) => ({
  actorId: actor.id,
  actorType: 'ADMIN',
  actorName: actor.email?.trim() || 'Quản trị viên',
  actorRole: actor.role || 'ADMIN',
});

export const changedAuditFields = (
  before: AuditRecord | null | undefined,
  after: AuditRecord | null | undefined,
) => {
  const fields = new Set([
    ...Object.keys(before ?? {}),
    ...Object.keys(after ?? {}),
  ]);

  return [...fields].filter(
    (field) =>
      JSON.stringify(before?.[field]) !== JSON.stringify(after?.[field]),
  );
};

export const buildAdminAuditLog = (
  input: AdminAuditLogInput,
): Prisma.AuditLogUncheckedCreateInput => ({
  ...adminAuditActorFields(input.actor),
  module: input.module,
  action: input.action,
  targetType: input.targetType,
  targetId: input.targetId,
  entityDisplayCode: input.entityDisplayCode ?? null,
  beforeJson: jsonValue(input.before),
  afterJson: jsonValue(input.after),
  changedFields:
    input.changedFields ?? changedAuditFields(input.before, input.after),
  changeSummary: input.changeSummary,
  reason: input.reason ?? null,
  result: input.result ?? 'SUCCESS',
  metadata: jsonValue(input.metadata),
});
