import { Module } from '@nestjs/common';
import { CampaignsController } from './campaigns.controller';
import { PublicCampaignsController } from './public-campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CampaignsController, PublicCampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignsModule {}
