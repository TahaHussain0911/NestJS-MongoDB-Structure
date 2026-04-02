import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { TypedConfigService } from 'src/config/typed-config.service';
import { RESET_PASSWORD_OTP_EXPIRY, SALT_ROUNDS } from 'src/utils/constants';
import { UserService } from '../user/user.service';
import {
  AuthResponseDto,
  AuthTokensResponseDto,
} from './dto/auth-response.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenPayload } from './types/token-payload';
import { LoginDto } from './dto/login.dto';
import { User } from '../user/user.schema';
import { MailService } from 'src/mail/mail.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { randomInt } from 'crypto';
import { generateOtp, getTimeDifference } from 'src/utils/helper';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly config: TypedConfigService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    await this.mailService.welcomeEmail({
      email: registerDto.email,
      name: registerDto.name,
    });
    const hashedPassword = await bcrypt.hash(registerDto.password, SALT_ROUNDS);
    const user = await this.userService.create({
      ...registerDto,
      password: hashedPassword,
    });
    const userId = String(user._id);
    const tokens = await this.generateTokens(userId, user.email);
    await this.userService.updateRefreshId(userId, tokens.refreshId!);
    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userService.findByEmail(
      loginDto.email,
      '+password',
    );
    await this.verifyPassword(loginDto.password, user.password);
    const userId = String(user._id);
    const tokens = await this.generateTokens(userId, user.email);
    await this.userService.updateRefreshId(userId, tokens.refreshId!);
    const { password, ...restUser } = user;
    return {
      user: restUser,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refreshTokens(user: User): Promise<AuthTokensResponseDto> {
    const { _id, email } = user;
    const userId = String(_id);
    const tokens = await this.generateTokens(userId, user.email);
    await this.userService.updateRefreshId(userId, tokens.refreshId!);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(userId: string): Promise<void> {
    await this.userService.updateRefreshId(userId, null);
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const user = await this.userService.findByEmail(
      forgotPasswordDto.email,
      '+otpExpires +otpVerified',
    );
    await this.validateAndSendOtp(user);
  }

  async resendOtp(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const user = await this.userService.findByEmail(
      forgotPasswordDto.email,
      '+otpExpires +otpVerified',
    );
    if (!user.otpExpires) {
      throw new BadRequestException(
        `First request for otp using /forgot-password route`,
      );
    }
    await this.validateAndSendOtp(user);
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<void> {
    const user = await this.userService.findByEmail(
      verifyOtpDto.email,
      '+otp +otpExpires +otpVerified',
    );
    if (user.otpVerified) {
      throw new HttpException(
        {
          message: 'Your otp is verified. You can change your password',
        },
        HttpStatus.OK,
      );
    }
    if (!user.otp || !user.otpExpires) {
      throw new BadRequestException('Invalid or expired OTP request');
    }

    if (new Date() > user.otpExpires) {
      throw new BadRequestException('OTP has expired');
    }

    const isOtpMatching = await bcrypt.compare(verifyOtpDto.otp, user.otp);
    if (!isOtpMatching) {
      throw new BadRequestException('Invalid OTP');
    }

    await this.userService.setOtpVerified(String(user._id));
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const user = await this.userService.findByEmail(
      resetPasswordDto.email,
      '+otpVerified',
    );

    if (!user.otpVerified) {
      throw new BadRequestException(
        'OTP not verified. Please verify your OTP first.',
      );
    }

    const hashedPassword = await bcrypt.hash(
      resetPasswordDto.newPassword,
      SALT_ROUNDS,
    );
    await this.userService.updatePasswordAuth(String(user._id), hashedPassword);
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.userService.findById(userId, '+password');
    await this.verifyPassword(changePasswordDto.oldPassword, user.password);

    const hashedPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      SALT_ROUNDS,
    );
    await this.userService.updatePasswordAuth(userId, hashedPassword);
  }

  private async validateAndSendOtp(user: User) {
    if (user.otpVerified) {
      throw new HttpException(
        {
          message: 'Your otp is verified. You can change your password',
        },
        HttpStatus.OK,
      );
    }
    if (user.otpExpires && !user.otpVerified && new Date() < user.otpExpires) {
      const timeDiff = getTimeDifference(new Date(user.otpExpires).getTime());
      throw new BadRequestException(
        `Please wait ${timeDiff.minutes}m ${timeDiff.seconds}s before requesting a new OTP.`,
      );
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + RESET_PASSWORD_OTP_EXPIRY); // 10 minutes

    const hashedOtp = await bcrypt.hash(otp, SALT_ROUNDS);
    await this.userService.saveOtp(String(user._id), hashedOtp, otpExpires);

    await this.mailService.sendPasswordResetOtpEmail({
      email: user.email,
      otp,
    });
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );
    if (!isPasswordMatching) {
      throw new BadRequestException('Invalid credentials');
    }
  }

  private async generateTokens(
    userId: string,
    email: string,
  ): Promise<AuthTokensResponseDto> {
    const payload: TokenPayload = {
      sub: userId,
      email,
    };
    const refreshId = randomBytes(16).toString('hex');
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.sign(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: '3d',
      }),
      this.jwtService.sign(
        { ...payload, refreshId },
        {
          secret: this.config.get('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);
    return {
      accessToken,
      refreshToken,
      refreshId,
    };
  }
}
