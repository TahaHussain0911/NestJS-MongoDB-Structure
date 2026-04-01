import { ApiProperty } from '@nestjs/swagger';

export class PaymentApiResponseDto<T> {
  @ApiProperty()
  message: string;

  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data: T;
}

export class PaymentIntentResponseDto {
  @ApiProperty({
    example: 'https://stripe.com/dw21321fw',
    description: 'Stripe client url for payment confirmation',
  })
  url: string;

  @ApiProperty()
  paymentId: string;
}
