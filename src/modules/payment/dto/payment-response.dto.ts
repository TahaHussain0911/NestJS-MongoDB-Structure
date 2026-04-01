import { ApiProperty } from '@nestjs/swagger';

export class PaymentApiMessageResponse {
  @ApiProperty()
  message: string;

  @ApiProperty()
  success: boolean;
}

export class PaymentApiResponseDto<T> extends PaymentApiMessageResponse {
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
