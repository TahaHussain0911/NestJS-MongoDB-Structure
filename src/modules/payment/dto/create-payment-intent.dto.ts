import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { CURRENCY_VALUES } from '../payment.schema';

export class CreatePaymentIntentDto {
  @ApiProperty()
  @IsMongoId()
  orderId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(CURRENCY_VALUES)
  currency?: string;
}
