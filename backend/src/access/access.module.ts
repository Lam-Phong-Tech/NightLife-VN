import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ActionPolicyGuard } from './action-policy.guard';
import { AccessService } from './access.service';

@Module({
  imports: [PrismaModule],
  providers: [AccessService, ActionPolicyGuard],
  exports: [AccessService, ActionPolicyGuard],
})
export class AccessModule {}
