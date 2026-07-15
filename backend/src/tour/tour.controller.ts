import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TourService } from './tour.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { Prisma, ProfileStatus } from '@prisma/client';

@Controller('admin/tours')
export class TourController {
  constructor(private readonly tourService: TourService) {}

  @Post()
  create(@Body() createTourDto: CreateTourDto) {
    return this.tourService.create(createTourDto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
    @Query('city') city?: string,
    @Query('status') status?: ProfileStatus,
  ) {
    const skip = page ? (Number(page) - 1) * (Number(limit) || 20) : 0;
    const take = limit ? Number(limit) : 20;

    const where: Prisma.TourWhereInput = {
      status: status || { not: 'DELETED' },
    };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { subtitle: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (city && city !== 'all') {
      where.city = city;
    }

    return this.tourService.findAll({ skip, take, where });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tourService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTourDto: UpdateTourDto) {
    return this.tourService.update(id, updateTourDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tourService.remove(id);
  }
}
