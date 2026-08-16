import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../access/access.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { TourService } from './tour.service';

interface RequestWithOptionalUser extends Request {
  user?: AuthenticatedUser;
}

@Controller('tours')
export class PublicTourController {
  constructor(private readonly tourService: TourService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('city') city?: string,
    @Query('q') q?: string,
    @Req() req?: RequestWithOptionalUser,
  ) {
    const skip = page ? (Number(page) - 1) * (Number(limit) || 20) : 0;
    const take = limit ? Number(limit) : 20;

    return this.tourService.findPublicAll({
      skip,
      take,
      city,
      q,
      user: req?.user,
    });
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('id') id: string, @Req() req?: RequestWithOptionalUser) {
    return this.tourService.findPublicOne(id, req?.user);
  }
}
