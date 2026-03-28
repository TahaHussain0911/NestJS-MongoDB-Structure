import { UserResponseDto } from 'src/modules/user/dto/user-response.dto';

export class AuthTokensResponseDto {
  accessToken: string;
  refreshToken: string;
  refreshId?: string;
}
export class AuthResponseDto extends AuthTokensResponseDto {
  user: UserResponseDto['user'];
}
