import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { TourService } from './tour.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuthenticatedUser } from '../access/access.service';
import { Prisma, ProfileStatus, UserRole } from '@prisma/client';

interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}

@Controller('admin/tours')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class TourController {
  constructor(private readonly tourService: TourService) {}

  @Post()
  create(@Body() createTourDto: CreateTourDto, @Req() req: RequestWithUser) {
    return this.tourService.create(createTourDto, req.user);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OPERATOR)
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
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OPERATOR)
  findOne(@Param('id') id: string) {
    return this.tourService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateTourDto: UpdateTourDto,
    @Req() req: RequestWithUser,
  ) {
    return this.tourService.update(id, updateTourDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.tourService.remove(id, req.user);
  }
}
