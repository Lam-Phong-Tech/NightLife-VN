import { Controller, Get, Param, Query } from '@nestjs/common';
import { TourService } from './tour.service';

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

    return this.tourService.findPublicAll({ skip, take, city });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tourService.findPublicOne(id);
  }
}
