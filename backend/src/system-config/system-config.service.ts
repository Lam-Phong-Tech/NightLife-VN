import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SystemConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async getConfig(key: string, defaultVal: any = null) {
    const config = await this.prisma.systemConfig.findUnique({
      where: { key },
    });
    return config?.value ?? defaultVal;
  }

  async setConfig(key: string, value: any, userId?: string) {
    return this.prisma.systemConfig.upsert({
      where: { key },
      update: {
        value,
        updatedBy: userId,
      },
      create: {
        key,
        value,
        updatedBy: userId,
      },
    });
  }
}
