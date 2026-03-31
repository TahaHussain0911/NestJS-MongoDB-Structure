import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, Types } from 'mongoose';
import { Product } from '../product/product.schema';
import { required } from 'zod/mini';
import { User } from '../user/user.schema';

export type OrderDocument = Order & Document;

export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Schema({
  _id: false,
})
export class OrderItem {
  @Prop({
    type: Types.ObjectId,
    ref: Product.name,
    required: true,
  })
  product: Types.ObjectId;

  @Prop({
    required: true,
    min: 1,
  })
  quantity: number;

  @Prop({
    required: true,
    min: 1,
  })
  price: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({
  timestamps: true,
})
export class Order {
  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId;

  @Prop({
    type: [OrderItem],
    required: true,
  })
  items: OrderItem[];

  @Prop({
    required: true,
  })
  totalAmount: number;

  @Prop({
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Prop({
    default: '',
  })
  shippingAddress?: string;

  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
  })
  user: Types.ObjectId;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
