import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TypedConfigService } from 'src/config/typed-config.service';
import { UserService } from 'src/modules/user/user.service';
import { TokenPayload } from '../types/token-payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly config: TypedConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: TokenPayload) {
    const user = await this.userService.findById(
      payload.sub,
      '+passwordChangedAt',
    );

    if (user.passwordChangedAt && payload.iat) {
      const passwordChangedInMs = new Date(user?.passwordChangedAt).getTime();
      if (payload.iat < Math.floor(passwordChangedInMs / 1000)) {
        throw new UnauthorizedException(
          'Recently changed password. Please log in again.',
        );
      }
    }

    return user;
  }
}
