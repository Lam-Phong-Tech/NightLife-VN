import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('admin/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(
    @Body() createCategoryDto: { name: string; slug: string; type?: string },
  ) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  findAll(@Query('type') type?: string) {
    return this.categoriesService.findAll(type);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: { name?: string; slug?: string; type?: string },
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
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
