import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, Types } from 'mongoose';
import { Product } from '../product/product.schema';
import { User } from '../user/user.schema';

export type CommentDocument = Comment & Document;

@Schema({
  timestamps: true,
})
export class Comment {
  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: User.name,
  })
  user: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: Product.name,
    required: true,
  })
  product: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: Comment.name,
    default: null,
  })
  parent: Types.ObjectId;

  @Prop({
    default: 0,
  })
  likesCount: number;

  @Prop({
    required: true,
  })
  content: string;

  @Prop({
    default: 0,
  })
  replyCount: number;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
