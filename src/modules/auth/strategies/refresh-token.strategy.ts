import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TypedConfigService } from 'src/config/typed-config.service';
import { UserService } from 'src/modules/user/user.service';
import { TokenPayload } from '../types/token-payload';
import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly userService: UserService,
    private readonly config: TypedConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: TokenPayload) {
    const authHeader = req.headers.authorization;
    const refreshToken = authHeader?.replace('Bearer ', '').trim();
    if (!refreshToken) {
      throw new UnauthorizedException('Please provide refresh token');
    }
    const user = await this.userService.findById(payload.sub, '+refreshId');
    const isValidRefreshToken = user.refreshId === payload.refreshId;
    if (!isValidRefreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const { refreshId, ...restUser } = user;
    return restUser;
  }
}
