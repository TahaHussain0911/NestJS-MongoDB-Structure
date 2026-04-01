import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, Types } from 'mongoose';
import { User } from '../user/user.schema';
import { Order } from '../order/order.schema';

export type PaymentDocument = Payment & Document;

export enum PaymentStatus {
  PENDING = 'pending',
  FAILED = 'failed',
  COMPLETED = 'completed',
  REFUNDED = 'refunded',
}

export enum CURRENCY_VALUES {
  USD = 'usd',
}

@Schema({
  timestamps: true,
})
export class Payment {
  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId;

  @Prop({
    required: true,
    unique: true,
  })
  sessionId: string;

  @Prop({
    default: null,
  })
  transactionId?: string;

  @Prop({
    required: true,
  })
  totalAmount: number;

  @Prop({
    enum: CURRENCY_VALUES,
    default: CURRENCY_VALUES.USD,
  })
  currency: string;

  @Prop({
    default: '',
  })
  paymentMethod?: string;

  @Prop({
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Prop({
    type: Types.ObjectId,
    ref: Order.name,
    unique: true,
  })
  order: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: User.name,
  })
  user: Types.ObjectId;
}
export const PaymentSchema = SchemaFactory.createForClass(Payment);
