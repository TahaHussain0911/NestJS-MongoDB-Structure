import { Injectable } from '@nestjs/common';
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

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly config: TypedConfigService,
    private readonly jwtService: JwtService,
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
    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
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
