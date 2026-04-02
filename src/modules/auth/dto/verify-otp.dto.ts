import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'The 6-digit OTP code sent to user email',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;
}
