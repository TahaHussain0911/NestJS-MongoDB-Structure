import { ApiProperty } from '@nestjs/swagger';
import { User } from '../user.schema';
import { PaginatedResponseDto } from 'src/common/dto/pagination-response.dto';

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

export class UserPaginatedResponseDto extends PaginatedResponseDto {
  @ApiProperty({
    type: [UserResponseDto['user']],
  })
  data: UserResponseDto['user'][];
}
