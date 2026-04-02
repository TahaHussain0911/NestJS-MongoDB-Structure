import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  AuthResponseDto,
  AuthTokensResponseDto,
} from './dto/auth-response.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenGuard } from 'src/common/guards/refresh-token.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from '../user/user.schema';
import { SwaggerRefreshTokenAuth } from 'src/utils/swagger.constants';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ModerateThrottle } from 'src/common/decorators/throttler.decorator';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('Auth')
@ModerateThrottle()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a user',
  })
  @ApiCreatedResponse({
    type: AuthResponseDto,
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login a user',
  })
  @ApiCreatedResponse({
    type: AuthResponseDto,
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh-token')
  @UseGuards(RefreshTokenGuard)
  @ApiBearerAuth(SwaggerRefreshTokenAuth)
  @ApiOperation({
    summary: 'Get access & refresh token',
  })
  @ApiOkResponse({
    type: AuthTokensResponseDto,
  })
  async refreshTokens(@GetUser() user: User): Promise<AuthTokensResponseDto> {
    return this.authService.refreshTokens(user);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Logout a user & reset refreshId',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
      },
    },
  })
  async logout(@GetUser('_id') userId: string): Promise<{ message: string }> {
    await this.authService.logout(userId);
    return {
      message: 'User logged out!',
    };
  }

  @Post('forgot-password')
  @ApiOperation({
    summary: 'Request OTP for password reset',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: { message: { type: 'string' } },
    },
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ message: string }> {
    await this.authService.forgotPassword(dto);
    return {
      message: 'If the email exists, an OTP has been sent.',
    };
  }

  @Post('verify-otp')
  @ApiOperation({
    summary: 'Verify OTP code for password reset',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: { message: { type: 'string' } },
    },
  })
  async verifyOtp(@Body() dto: VerifyOtpDto): Promise<{ message: string }> {
    await this.authService.verifyOtp(dto);
    return {
      message: 'OTP verified successfully.',
    };
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset password using verified OTP status',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: { message: { type: 'string' } },
    },
  })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    await this.authService.resetPassword(dto);
    return {
      message: 'Password reset successfully.',
    };
  }

  @Post('resend-otp')
  @ApiOperation({
    summary: 'Resend OTP for password reset',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: { message: { type: 'string' } },
    },
  })
  async resendOtp(@Body() dto: ForgotPasswordDto): Promise<{ message: string }> {
    await this.authService.resendOtp(dto);
    return {
      message: 'New OTP has been sent.',
    };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Change password for an authenticated user',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: { message: { type: 'string' } },
    },
  })
  async changePassword(
    @GetUser('_id') userId: string,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.changePassword(userId, dto);
    return {
      message: 'Password changed successfully.',
    };
  }
}
