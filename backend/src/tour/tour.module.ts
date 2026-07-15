import { Module } from '@nestjs/common';
import { TourController } from './tour.controller';
import { PublicTourController } from './public-tour.controller';
import { TourService } from './tour.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TourController, PublicTourController],
  providers: [TourService],
  exports: [TourService],
})
export class TourModule {}
