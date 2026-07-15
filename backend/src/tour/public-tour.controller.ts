import { Controller, Get, Param, Query } from '@nestjs/common';
import { TourService } from './tour.service';
import { Prisma } from '@prisma/client';

@Controller('tours')
export class PublicTourController {
  constructor(private readonly tourService: TourService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('city') city?: string,
  ) {
    const skip = page ? (Number(page) - 1) * (Number(limit) || 20) : 0;
    const take = limit ? Number(limit) : 20;

    const where: Prisma.TourWhereInput = {
      status: 'ACTIVE',
    };

    if (city) {
      where.city = city;
    }

    return this.tourService.findAll({ skip, take, where });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tourService.findOne(id);
  }
}
