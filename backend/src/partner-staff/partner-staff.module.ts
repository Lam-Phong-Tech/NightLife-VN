import { Module } from '@nestjs/common';
import { PartnerStaffService } from './partner-staff.service';
import { PartnerStaffController } from './partner-staff.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AccessModule } from '../access/access.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [PrismaModule, CommonModule, AccessModule],
  providers: [PartnerStaffService],
  controllers: [PartnerStaffController],
  exports: [PartnerStaffService],
})
export class PartnerStaffModule {}
