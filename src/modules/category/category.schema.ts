import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, type ObjectId } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({
  timestamps: true,
})
export class Category {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({
    required: true,
  })
  title: string;

  @Prop({
    default: '',
  })
  description?: string;

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

export const CategorySchema = SchemaFactory.createForClass(Category);
