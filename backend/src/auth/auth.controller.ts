import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthRateLimit } from './auth-rate-limit.decorator';
import { AuthRateLimitGuard } from './auth-rate-limit.guard';
import { AuthService } from './auth.service';
import {
  AuthResponseDto,
  GoogleConfigResponseDto,
  LineConfigResponseDto,
  LogoutResponseDto,
  PublicUserDto,
} from './dto/auth-response.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { LoginDto } from './dto/login.dto';
import {
  PasswordResetCompleteResponseDto,
  PasswordResetRequestResponseDto,
  PasswordResetVerifyResponseDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
  VerifyPasswordResetCodeDto,
} from './dto/password-reset.dto';
import {
  RegisterDto,
  RegistrationOtpRequestResponseDto,
  RequestRegistrationOtpDto,
} from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

@ApiTags('auth')
@AuthRateLimit({
  scope: 'auth',
  limit: 60,
  windowMs: 60 * 1000,
})
@UseGuards(AuthRateLimitGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiCreatedResponse({ type: AuthResponseDto })
  @AuthRateLimit({
    scope: 'registration-verification',
    limit: 10,
    identityLimit: 5,
    windowMs: FIFTEEN_MINUTES_MS,
  })
  @Post('register')
  register(@Body() dto: RegisterDto, @Req() request: Request) {
    return this.authService.register(dto, this.sessionContext(request));
  }

  @ApiOperation({ summary: 'Gửi mã OTP xác thực email đăng ký' })
  @ApiOkResponse({ type: RegistrationOtpRequestResponseDto })
  @AuthRateLimit({
    scope: 'registration-otp-request',
    limit: 5,
    identityLimit: 3,
    windowMs: FIFTEEN_MINUTES_MS,
  })
  @Post('register/email-otp')
  requestRegistrationOtp(@Body() dto: RequestRegistrationOtpDto) {
    return this.authService.requestRegistrationOtp(dto);
  }

  @ApiOperation({ summary: 'Đăng nhập chung' })
  @ApiOkResponse({ type: AuthResponseDto })
  @AuthRateLimit({
    scope: 'password-login',
    limit: 20,
    identityLimit: 5,
    windowMs: FIFTEEN_MINUTES_MS,
  })
  @Post('login')
  login(@Body() dto: LoginDto, @Req() request: Request) {
    return this.authService.login(dto, this.sessionContext(request));
  }

  @ApiOperation({ summary: 'Gửi mã đặt lại mật khẩu qua email' })
  @ApiOkResponse({ type: PasswordResetRequestResponseDto })
  @AuthRateLimit({
    scope: 'password-reset-request',
    limit: 5,
    identityLimit: 3,
    windowMs: FIFTEEN_MINUTES_MS,
  })
  @Post('password-reset/request')
  requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(dto);
  }

  @ApiOperation({ summary: 'Xác thực mã đặt lại mật khẩu' })
  @ApiOkResponse({ type: PasswordResetVerifyResponseDto })
  @AuthRateLimit({
    scope: 'password-reset-verification',
    limit: 10,
    identityLimit: 5,
    windowMs: FIFTEEN_MINUTES_MS,
  })
  @Post('password-reset/verify')
  verifyPasswordResetCode(@Body() dto: VerifyPasswordResetCodeDto) {
    return this.authService.verifyPasswordResetCode(dto);
  }

  @ApiOperation({ summary: 'Cập nhật mật khẩu mới sau khi xác thực mã' })
  @ApiOkResponse({ type: PasswordResetCompleteResponseDto })
  @AuthRateLimit({
    scope: 'password-reset-completion',
    limit: 10,
    identityLimit: 5,
    windowMs: FIFTEEN_MINUTES_MS,
  })
  @Post('password-reset/complete')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @ApiOperation({ summary: 'Đăng nhập cho Member' })
  @ApiOkResponse({ type: AuthResponseDto })
  @AuthRateLimit({
    scope: 'member-password-login',
    limit: 20,
    identityLimit: 5,
    windowMs: FIFTEEN_MINUTES_MS,
  })
  @Post('login/member')
  loginMember(@Body() dto: LoginDto, @Req() request: Request) {
    return this.authService.loginAs('USER', dto, this.sessionContext(request));
  }

  @ApiOperation({ summary: 'Đăng nhập Google cho Member' })
  @ApiOkResponse({ type: AuthResponseDto })
  @AuthRateLimit({
    scope: 'social-login',
    limit: 20,
    windowMs: FIFTEEN_MINUTES_MS,
  })
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
  @AuthRateLimit({
    scope: 'line-login',
    limit: 30,
    windowMs: FIFTEEN_MINUTES_MS,
  })
  @Get('line/start')
  startLineLogin(
    @Query('redirect') redirect: string | undefined,
    @Res() response: Response,
  ) {
    return this.authService.redirectToLineLogin(redirect, response);
  }

  @ApiOperation({ summary: 'Callback xử lý đăng nhập Line' })
  @AuthRateLimit({
    scope: 'line-login',
    limit: 30,
    windowMs: FIFTEEN_MINUTES_MS,
  })
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
  @AuthRateLimit({
    scope: 'partner-password-login',
    limit: 20,
    identityLimit: 5,
    windowMs: FIFTEEN_MINUTES_MS,
  })
  @Post('login/partner')
  loginPartner(@Body() dto: LoginDto, @Req() request: Request) {
    return this.authService.loginForPortal(
      ['PARTNER', 'STAFF'],
      dto,
      this.sessionContext(request),
    );
  }

  @ApiOperation({ summary: 'Đăng nhập cho Operator' })
  @ApiOkResponse({ type: AuthResponseDto })
  @AuthRateLimit({
    scope: 'operator-password-login',
    limit: 20,
    identityLimit: 5,
    windowMs: FIFTEEN_MINUTES_MS,
  })
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
  @AuthRateLimit({
    scope: 'admin-password-login',
    limit: 20,
    identityLimit: 5,
    windowMs: FIFTEEN_MINUTES_MS,
  })
  @Post('login/admin')
  loginAdmin(@Body() dto: LoginDto, @Req() request: Request) {
    return this.authService.loginForPortal(
      ['OPERATOR', 'ADMIN', 'SUPER_ADMIN'],
      dto,
      this.sessionContext(request),
    );
  }

  @ApiOperation({ summary: 'Lấy thông tin tài khoản hiện tại' })
  @ApiOkResponse({ type: PublicUserDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() request: Request & { user: { id: string } }) {
    return this.authService.me(request.user.id);
  }

  @ApiOperation({ summary: 'Cập nhật thông tin tài khoản hiện tại' })
  @ApiOkResponse({ type: PublicUserDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(
    @Req() request: Request & { user: { id: string } },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(request.user.id, dto);
  }

  @ApiOperation({ summary: 'Đăng xuất tài khoản' })
  @ApiCreatedResponse({ type: LogoutResponseDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Req()
    request: Request & { user: { id: string; jti?: string; exp?: number } },
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.logout(request.user);
    this.authService.clearAuthCookies(response);
    return result;
  }

  private sessionContext(request: Request) {
    return {
      userAgent: request.get('user-agent'),
      ipAddress: request.ip,
    };
  }
}
