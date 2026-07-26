import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuthenticatedUser } from '../access/access.service';
import { UserRole } from '@prisma/client';

interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}

@Controller('admin/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(
    @Body() createCategoryDto: { name: string; slug: string; type?: string },
    @Req() req: RequestWithUser,
  ) {
    return this.categoriesService.create(createCategoryDto, req.user);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OPERATOR)
  findAll(@Query('type') type?: string) {
    return this.categoriesService.findAll(type);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: { name?: string; slug?: string; type?: string },
    @Req() req: RequestWithUser,
  ) {
    return this.categoriesService.update(id, updateCategoryDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.categoriesService.remove(id, req.user);
  }
}

@Controller('categories')
export class PublicCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@Query('type') type?: string) {
    return this.categoriesService.findAll(type);
  }
}
