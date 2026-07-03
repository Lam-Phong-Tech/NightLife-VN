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
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthResponseDto, GoogleConfigResponseDto, LineConfigResponseDto, LogoutResponseDto, PublicUserDto } from './dto/auth-response.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiCreatedResponse({ type: AuthResponseDto })
  @Post('register')
  register(@Body() dto: RegisterDto, @Req() request: Request) {
    return this.authService.register(dto, this.sessionContext(request));
  }

  @ApiOperation({ summary: 'Đăng nhập chung' })
  @ApiOkResponse({ type: AuthResponseDto })
  @Post('login')
  login(@Body() dto: LoginDto, @Req() request: Request) {
    return this.authService.login(dto, this.sessionContext(request));
  }

  @ApiOperation({ summary: 'Đăng nhập cho Member' })
  @ApiOkResponse({ type: AuthResponseDto })
  @Post('login/member')
  loginMember(@Body() dto: LoginDto, @Req() request: Request) {
    return this.authService.loginAs('USER', dto, this.sessionContext(request));
  }

  @ApiOperation({ summary: 'Đăng nhập Google cho Member' })
  @ApiOkResponse({ type: AuthResponseDto })
  @Post('google/member')
  loginGoogleMember(@Body() dto: GoogleAuthDto, @Req() request: Request) {
    return this.authService.loginGoogleMember(
      dto,
      this.sessionContext(request),
    );
  }

  @ApiOperation({ summary: 'Lấy cấu hình Google Login' })
  @ApiOkResponse({ type: GoogleConfigResponseDto })
  @Get('google/config')
  googleConfig() {
    return this.authService.googleLoginConfig();
  }

  @ApiOperation({ summary: 'Lấy cấu hình Line Login' })
  @ApiOkResponse({ type: LineConfigResponseDto })
  @Get('line/config')
  lineConfig() {
    return this.authService.lineLoginConfig();
  }

  @ApiOperation({ summary: 'Bắt đầu luồng đăng nhập Line' })
  @Get('line/start')
  startLineLogin(
    @Query('redirect') redirect: string | undefined,
    @Res() response: Response,
  ) {
    return this.authService.redirectToLineLogin(redirect, response);
  }

  @ApiOperation({ summary: 'Callback xử lý đăng nhập Line' })
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

  @ApiOperation({ summary: 'Đăng nhập cho Partner' })
  @ApiOkResponse({ type: AuthResponseDto })
  @Post('login/partner')
  loginPartner(@Body() dto: LoginDto, @Req() request: Request) {
    return this.authService.loginAs(
      'PARTNER',
      dto,
      this.sessionContext(request),
    );
  }

  @ApiOperation({ summary: 'Đăng nhập cho Operator' })
  @ApiOkResponse({ type: AuthResponseDto })
  @Post('login/operator')
  loginOperator(@Body() dto: LoginDto, @Req() request: Request) {
    return this.authService.loginAs(
      'OPERATOR',
      dto,
      this.sessionContext(request),
    );
  }

  @ApiOperation({ summary: 'Đăng nhập cho Admin' })
  @ApiOkResponse({ type: AuthResponseDto })
  @Post('login/admin')
  loginAdmin(@Body() dto: LoginDto, @Req() request: Request) {
    return this.authService.loginAs('ADMIN', dto, this.sessionContext(request));
  }

  @ApiOperation({ summary: 'Lấy thông tin tài khoản hiện tại' })
  @ApiOkResponse({ type: PublicUserDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() request: Request & { user: { id: string } }) {
    return this.authService.me(request.user.id);
  }

  @ApiOperation({ summary: 'Đăng xuất tài khoản' })
  @ApiCreatedResponse({ type: LogoutResponseDto })
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
