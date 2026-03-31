import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, Types } from 'mongoose';
import { Product } from '../product/product.schema';
import { User } from '../user/user.schema';
import { CART_EXPIRY_SECS } from 'src/utils/constants';

export type CartDocument = Cart & Document;

@Schema({ _id: false }) // _id: false prevents creating _id for subdocuments
export class CartItem {
  @Prop({
    type: Types.ObjectId,
    ref: Product.name, // Use string name instead of Product.name
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
    min: 0,
  })
  price: number;
}

// Create the schema for CartItem
export const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({
  timestamps: true,
})
export class Cart {
  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId;

  @Prop({
    default: false,
  })
  checkedOut: boolean;

  @Prop({
    type: [CartItem],
    required: true,
  })
  items: CartItem[];

  @Prop({
    type: Types.ObjectId,
    ref: User.name,
  })
  user: Types.ObjectId;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

// CartSchema.index({ createdAt: 1 }, { expireAfterSeconds: CART_EXPIRY_SECS });
