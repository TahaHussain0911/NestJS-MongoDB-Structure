import { ApiProperty } from '@nestjs/swagger';
import { User } from '../user.schema';

export class UserResponseDto {
  @ApiProperty()
  user: Omit<
    User,
    | 'password'
    | 'refreshId'
    | 'otp'
    | 'otpExpires'
    | 'otpVerified'
    | 'passwordChangedAt'
  >;
}

export class UserPaginatedResponseDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  data: UserResponseDto['user'][];
}
