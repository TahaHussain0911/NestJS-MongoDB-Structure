import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, Types } from 'mongoose';
import { Category } from '../category/category.schema';

export type ProductDocument = Product & Document;

@Schema({
  timestamps: true,
})
export class Product {
  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId;

  @Prop({
    required: true,
  })
  title: string;

  @Prop({
    default: '',
  })
  description?: string;

  @Prop({
    type: Types.ObjectId,
    ref: Category.name,
  })
  category: Types.ObjectId;

  @Prop({
    required: true,
    default: 0,
  })
  stock: number;

  @Prop({
    required: true,
    unique: true,
  })
  sku: string;

  @Prop({
    required: true,
  })
  price: number;

  @Prop({
    default: '',
  })
  imageUrl?: string;

  @Prop({
    required: true,
    unique: true,
  })
  slug: string;

  @Prop({
    default: true,
  })
  isActive: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
