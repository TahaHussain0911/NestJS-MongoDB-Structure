import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { OrderProductPopulate } from 'src/common/populates/product.populate';
import { TypedConfigService } from 'src/config/typed-config.service';
import { convertStringToMongoIds } from 'src/utils/helper';
import Stripe from 'stripe';
import { Cart, CartDocument } from '../cart/cart.schema';
import { Order, OrderDocument, OrderStatus } from '../order/order.schema';
import { Product, ProductDocument } from '../product/product.schema';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import {
  PaymentApiMessageResponse,
  PaymentApiResponseDto,
  PaymentIntentResponseDto,
} from './dto/payment-response.dto';
import {
  CURRENCY_VALUES,
  Payment,
  PaymentDocument,
  PaymentStatus,
} from './payment.schema';

@Injectable()
export class PaymentService {
  private stripe: Stripe;
  private readonly logger = new Logger();
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private config: TypedConfigService,
    @InjectConnection() private readonly connection: Connection,
  ) {
    this.stripe = new Stripe(config.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2026-03-25.dahlia',
    });
  }

  async createPaymentIntent(
    createPaymentIntentDto: CreatePaymentIntentDto,
    userId: string,
  ): Promise<PaymentApiResponseDto<PaymentIntentResponseDto>> {
    const { orderId, currency } = createPaymentIntentDto;
    const order = await this.orderModel
      .findOne({
        _id: orderId,
        user: userId,
      })
      .populate(OrderProductPopulate);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    const existingPayment = await this.paymentModel.findOne({
      order: order._id,
    });
    if (existingPayment) {
      if (existingPayment.status === PaymentStatus.COMPLETED) {
        throw new BadRequestException(
          'Payment already completed for this order',
        );
      }
      if (existingPayment.status === PaymentStatus.PENDING) {
        const existingPaymentIntent =
          await this.stripe.checkout.sessions.retrieve(
            existingPayment.sessionId,
          );
        return {
          message: 'Existing payment session retrieved',
          success: true,
          data: {
            paymentId: existingPayment._id?.toString(),
            url: existingPaymentIntent.url!,
          },
        };
      }
    }
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: this.config.get('FRONTEND_SUCCESS_URL'),
      cancel_url: this.config.get('FRONTEND_CANCEL_URL'),
      line_items: order.items.map((item) => {
        const product = item.product as unknown as ProductDocument;
        return {
          price_data: {
            currency: currency || CURRENCY_VALUES.USD,
            product_data: {
              name: product.title,
              ...(product.description && { description: product.description }),
              ...(product.imageUrl &&
                product.imageUrl.startsWith('http') && {
                  images: [product.imageUrl],
                }),
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        };
      }),
      metadata: {
        userId: userId.toString(),
        orderId,
      },
    });
    const payment = await this.paymentModel.create({
      sessionId: session.id,
      totalAmount: order.totalAmount,
      currency,
      paymentMethod: 'STRIPE',
      order: order._id,
      user: userId,
    });
    return {
      message: 'Payment intent created successfully',
      success: true,
      data: {
        url: session.url!,
        paymentId: payment._id?.toString(),
      },
    };
  }

  async handleWebhook(signature: string, payload: Buffer): Promise<void> {
    const webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET');

    let event: Stripe.Event;

    try {
      event = await this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );

      this.logger.log(`Webhook received ${event.type}`);
      this.logger.log(`Webhook payload ${event.data.object}`);

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(
            event.data.object as Stripe.Checkout.Session,
          );
          break;
        case 'checkout.session.async_payment_failed':
          await this.handleCheckoutSessionFailed(
            event.data.object as Stripe.Checkout.Session,
          );
          break;
        case 'checkout.session.expired':
          await this.handleCheckoutSessionExpired(
            event.data.object as Stripe.Checkout.Session,
          );
          break;
        case 'charge.refunded':
          await this.handleChargeRefunded(event.data.object as Stripe.Charge);
          break;
        default:
          break;
      }
    } catch (error) {
      this.logger.error(`Webhook verification failed ${error.message}`);
      throw new BadRequestException(
        `Webhook verification failed ${error.message}`,
      );
    }
  }

  async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    const transactionId = session.payment_intent;

    try {
      const payment = await this.paymentModel.findOne({
        sessionId: session.id,
      });
      if (!payment) {
        this.logger.error(`Payment not found for session: ${session.id}`);
        return;
      }
      if (payment.status === PaymentStatus.COMPLETED) {
        this.logger.error(
          `Payment is already completed for session ${session.id}`,
        );
        return;
      }
      const transaction = await this.connection.startSession();

      transaction.startTransaction();
      try {
        await this.paymentModel.updateOne(
          {
            _id: payment._id,
          },
          {
            status: PaymentStatus.COMPLETED,
            transactionId,
          },
          { session: transaction },
        );
        const updatedOrder = await this.orderModel.findByIdAndUpdate(
          payment.order,
          {
            status: OrderStatus.COMPLETED,
          },
          { session: transaction },
        );
        await this.cartModel.updateOne(
          {
            _id: updatedOrder?.cart,
          },
          {
            checkedOut: true,
          },
          { session: transaction },
        );
        await transaction.commitTransaction();
      } catch (error) {
        await transaction.abortTransaction();
        this.logger.error(`Payment updating failed ${error.message}`);
        throw error;
      } finally {
        transaction.endSession();
      }
      this.logger.log(
        `Payment success handled for user: ${payment.user} having paymentId: ${payment._id} and orderId ${payment.order}`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing payment: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async handleCheckoutSessionFailed(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    const transactionId = session.payment_intent;

    const payment = await this.paymentModel.findOne({
      sessionId: session.id,
    });
    if (!payment) {
      this.logger.error(`Payment not found for session: ${session.id}`);
      return;
    }
    await this.paymentModel.findOneAndUpdate(
      {
        sessionId: session.id,
      },
      {
        status: PaymentStatus.FAILED,
        transactionId,
      },
    );
    this.logger.log(
      `Payment fail handled for user: ${payment.user} having paymentId: ${payment._id} and orderId ${payment.order}`,
    );
  }

  async handleCheckoutSessionExpired(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    const payment = await this.paymentModel.findOneAndDelete({
      sessionId: session.id,
    });
    if (!payment) {
      this.logger.error(`Payment not found for session: ${session.id}`);
      return;
    }
  }

  async handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
    const transactionId = charge.payment_intent as string;
    const payment = await this.paymentModel.findOne({
      transactionId,
    });
    if (!payment) {
      this.logger.error(
        `Payment not found for payment intent: ${transactionId}`,
      );
      return;
    }
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      await this.paymentModel.updateOne(
        {
          _id: payment._id,
        },
        {
          status: PaymentStatus.REFUNDED,
        },
        { session },
      );
      const updatedOrder = await this.orderModel.findByIdAndUpdate(
        payment.order,
        {
          status: OrderStatus.CANCELLED,
        },
        { session },
      );
      if (!updatedOrder) throw new Error('Order not found');
      for (const item of updatedOrder.items) {
        await this.productModel.updateOne(
          {
            _id: item.product,
          },
          {
            $inc: {
              stock: item.quantity,
            },
          },
          { session },
        );
      }
      await session.commitTransaction();
      this.logger.log(
        `Payment refunded for user ${payment.user} with payment ${payment._id} and order ${payment.order}`,
      );
    } catch (error) {
      await session.abortTransaction();
      this.logger.error(`Error: ${error.message}`);
    } finally {
      session.endSession();
    }
  }

  async refundPayment(
    userId: string,
    orderId: string,
  ): Promise<PaymentApiMessageResponse> {
    const payment = await this.paymentModel.findOne({
      order: convertStringToMongoIds(orderId),
      user: convertStringToMongoIds(userId),
    });
    if (!payment) {
      throw new NotFoundException('Payment not found for this order');
    }
    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException(`Only completed payments can be completed`);
    }
    await this.stripe.refunds.create({
      payment_intent: payment.transactionId,
      metadata: {
        userId: userId.toString(),
        orderId,
      },
    });
    return {
      success: true,
      message: 'Payment refunded successfully',
    };
  }
}
