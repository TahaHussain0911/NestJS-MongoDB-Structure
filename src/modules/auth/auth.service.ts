import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { TypedConfigService } from 'src/config/typed-config.service';
import { SALT_ROUNDS } from 'src/utils/constants';
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

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly config: TypedConfigService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const hashedPassword = await bcrypt.hash(registerDto.password, SALT_ROUNDS);
    const user = await this.userService.create({
      ...registerDto,
      password: hashedPassword,
    });
    const userId = String(user._id);
    const tokens = await this.generateTokens(userId, user.email);
    await this.userService.updateRefreshId(userId, tokens.refreshId!);
    await this.mailService.welcomeEmail({
      email: user.email,
    });
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
