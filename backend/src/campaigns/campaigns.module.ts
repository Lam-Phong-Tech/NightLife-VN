import { Module } from '@nestjs/common';
import { CampaignsController } from './campaigns.controller';
import { PublicCampaignsController } from './public-campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AccessModule } from '../access/access.module';

@Module({
  imports: [PrismaModule, AccessModule],
  controllers: [CampaignsController, PublicCampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignsModule {}
