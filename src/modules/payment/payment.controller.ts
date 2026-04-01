import {
  Body,
  Controller,
  Headers,
  Param,
  Post,
  type RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { StrictThrottle } from 'src/common/decorators/throttler.decorator';
import { PaymentService } from './payment.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import {
  PaymentApiMessageResponse,
  PaymentApiResponseDto,
  PaymentIntentResponseDto,
} from './dto/payment-response.dto';
import { Payment } from './payment.schema';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { SwaggerJwtAuth } from 'src/utils/swagger.constants';

@ApiTags('Payment')
@StrictThrottle()
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-intent')
  @ApiBearerAuth(SwaggerJwtAuth)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create a payment intent',
  })
  @ApiOkResponse({
    type: PaymentApiResponseDto<Payment>,
  })
  async createPaymentIntent(
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
    @GetUser('_id') userId: string,
  ): Promise<PaymentApiResponseDto<PaymentIntentResponseDto>> {
    return this.paymentService.createPaymentIntent(
      createPaymentIntentDto,
      userId,
    );
  }

  @SkipThrottle()
  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ): Promise<{ received: boolean }> {
    const payload = request.rawBody;
    if (!payload) {
      throw new Error('Raw body not available');
    }
    await this.paymentService.handleWebhook(signature, payload);
    return {
      received: true,
    };
  }

  @Post('refund/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(SwaggerJwtAuth)
  @ApiOperation({
    summary: 'Refund order payment',
  })
  @ApiOkResponse({
    type: PaymentApiMessageResponse,
  })
  async refundPayment(
    @GetUser('_id') userId: string,
    @Param('orderId') orderId: string,
  ): Promise<PaymentApiMessageResponse> {
    return this.paymentService.refundPayment(userId, orderId);
  }
}
