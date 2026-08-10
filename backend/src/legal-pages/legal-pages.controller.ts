import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import type * as express from 'express';
import { ActionPolicy } from '../access/action-policy.decorator';
import { ActionPolicyGuard } from '../access/action-policy.guard';
import { AuthenticatedUser } from '../access/access.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UpdateLegalPageDto } from './dto/update-legal-page.dto';
import { LegalPagesService } from './legal-pages.service';

type RequestWithUser = express.Request & { user: AuthenticatedUser };

@Controller()
export class LegalPagesController {
  constructor(private readonly legalPagesService: LegalPagesService) {}

  @Get('legal-pages')
  listPublic() {
    return this.legalPagesService.listPublic();
  }

  @Get('legal-pages/:slug')
  getPublic(@Param('slug') slug: string) {
    return this.legalPagesService.getPublic(slug);
  }

  @ActionPolicy('canViewAdminLegalPages')
  @Roles('OPERATOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
  @Get('admin/legal-pages')
  listAdmin(@Req() request: RequestWithUser) {
    return this.legalPagesService.listAdmin(request.user);
  }

  @ActionPolicy('canUpdateAdminLegalPages')
  @Roles('OPERATOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard, ActionPolicyGuard)
  @Patch('admin/legal-pages/:key')
  update(
    @Req() request: RequestWithUser,
    @Param('key') key: string,
    @Body() dto: UpdateLegalPageDto,
  ) {
    return this.legalPagesService.update(request.user, key, dto);
  }
}
