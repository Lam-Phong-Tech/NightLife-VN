import { Module } from '@nestjs/common';
import { AccessModule } from '../access/access.module';
import { AuthModule } from '../auth/auth.module';
import { LegalPagesController } from './legal-pages.controller';
import { LegalPagesService } from './legal-pages.service';

@Module({
  imports: [AccessModule, AuthModule],
  controllers: [LegalPagesController],
  providers: [LegalPagesService],
})
export class LegalPagesModule {}
