import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

function createPrismaOptions(connectionString: string) {
  if (process.env.NODE_ENV === 'test') {
    return {
      adapter: {
        provider: 'postgres',
        adapterName: 'test',
      },
    } as never;
  }

  const { PrismaPg } = require('@prisma/adapter-pg') as {
    PrismaPg: new (options: { connectionString: string }) => unknown;
  };

  return {
    adapter: new PrismaPg({ connectionString }),
  } as never;
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly configService: ConfigService) {
    super(createPrismaOptions(configService.getOrThrow<string>('DATABASE_URL')));
  }

  async onModuleInit() {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
