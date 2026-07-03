import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto, @Req() request: Request) {
    return this.authService.register(dto, this.sessionContext(request));
  }

  @Post('login')
  login(@Body() dto: LoginDto, @Req() request: Request) {
    return this.authService.login(dto, this.sessionContext(request));
  }

  @Post('login/member')
  loginMember(@Body() dto: LoginDto, @Req() request: Request) {
    return this.authService.loginAs('USER', dto, this.sessionContext(request));
  }

  @Post('google/member')
  loginGoogleMember(@Body() dto: GoogleAuthDto, @Req() request: Request) {
    return this.authService.loginGoogleMember(
      dto,
      this.sessionContext(request),
    );
  }

  @Get('google/config')
  googleConfig() {
    return this.authService.googleLoginConfig();
  }

  @Get('line/config')
  lineConfig() {
    return this.authService.lineLoginConfig();
  }

  @Get('line/start')
  startLineLogin(
    @Query('redirect') redirect: string | undefined,
    @Res() response: Response,
  ) {
    return this.authService.redirectToLineLogin(redirect, response);
  }

  @Get('line/callback')
  handleLineCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') error: string | undefined,
    @Query('error_description') errorDescription: string | undefined,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    return this.authService.handleLineCallback(
      {
        code,
        state,
        error,
        errorDescription,
      },
      request,
      response,
      this.sessionContext(request),
    );
  }

  @Post('login/partner')
  loginPartner(@Body() dto: LoginDto, @Req() request: Request) {
    return this.authService.loginAs(
      'PARTNER',
      dto,
      this.sessionContext(request),
    );
  }

  @Post('login/operator')
  loginOperator(@Body() dto: LoginDto, @Req() request: Request) {
    return this.authService.loginAs(
      'OPERATOR',
      dto,
      this.sessionContext(request),
    );
  }

  @Post('login/admin')
  loginAdmin(@Body() dto: LoginDto, @Req() request: Request) {
    return this.authService.loginAs('ADMIN', dto, this.sessionContext(request));
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() request: Request & { user: { id: string } }) {
    return this.authService.me(request.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(
    @Req()
    request: Request & { user: { id: string; jti?: string; exp?: number } },
  ) {
    return this.authService.logout(request.user);
  }

  private sessionContext(request: Request) {
    return {
      userAgent: request.get('user-agent'),
      ipAddress: request.ip,
    };
  }
}
