import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../access/access.service';
import { buildAdminAuditLog } from '../audit-logs/admin-audit';

@Injectable()
export class SystemConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async getConfig(key: string, defaultVal: any = null) {
    const config = await this.prisma.systemConfig.findUnique({
      where: { key },
    });
    return config?.value ?? defaultVal;
  }

  async setConfig(key: string, value: any, actor: AuthenticatedUser) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.systemConfig.findUnique({
        where: { key },
      });
      const config = await tx.systemConfig.upsert({
        where: { key },
        update: {
          value,
          updatedBy: actor.id,
        },
        create: {
          key,
          value,
          updatedBy: actor.id,
        },
      });

      const isAppearance = key === 'appearance';
      await tx.auditLog.create({
        data: buildAdminAuditLog({
          actor,
          module: isAppearance ? 'Appearance' : 'SystemConfig',
          action: isAppearance ? 'appearance.update' : 'system_config.update',
          targetType: 'SystemConfig',
          targetId: key,
          entityDisplayCode: key,
          before: { value: existing?.value ?? null },
          after: { value: config.value },
          changeSummary: isAppearance
            ? 'Đã cập nhật giao diện hệ thống'
            : `Đã cập nhật cấu hình "${key}"`,
        }),
      });

      return config;
    });
  }

  async getStorageUsage() {
    const config = await this.getConfig('VPS_MAX_STORAGE_GB', { limit: 50 });
    const limitGB = typeof config?.limit === 'number' ? config.limit : 50;

    // Sum sizeBytes from Media table
    const result = await this.prisma.media.aggregate({
      _sum: {
        sizeBytes: true,
      },
    });

    const usedBytes = result._sum.sizeBytes || 0;
    const usedGB = usedBytes / (1024 * 1024 * 1024);

    const percentage = limitGB > 0 ? (usedGB / limitGB) * 100 : 0;
    const isExceeded = usedGB >= limitGB;

    return {
      limit: limitGB,
      used: Number(usedGB.toFixed(4)),
      usedBytes,
      percentage: Number(percentage.toFixed(2)),
      isExceeded,
    };
  }
}
