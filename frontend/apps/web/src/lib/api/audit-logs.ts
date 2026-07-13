import client from './client';

export type AuditLogRec = {
  id: string;
  actorId?: string;
  actorType?: string;
  actorName?: string;
  actorRole?: string;
  module?: string;
  action: string;
  targetType: string;
  targetId: string;
  entityDisplayCode?: string;
  beforeJson?: any;
  afterJson?: any;
  changedFields?: string[];
  changeSummary?: string;
  reason?: string;
  result?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  batchId?: string;
  metadata?: any;
  createdAt: string;
};

export async function getAuditLogs(params?: {
  page?: number;
  limit?: number;
  module?: string;
  action?: string;
  result?: string;
}) {
  const res = await client.get('/admin/audit-logs', { params });
  return res.data;
}

export async function getAuditLogById(id: string) {
  const res = await client.get(`/admin/audit-logs/${id}`);
  return res.data;
}
