import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController, PublicCategoriesController } from './categories.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CategoriesController, PublicCategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
