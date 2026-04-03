import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, Types } from 'mongoose';
import { User } from '../user/user.schema';
import { Product } from '../product/product.schema';
import { Comment } from '../comment/comment.schema';

export type LikeDocument = Like & Document;

@Schema({
  timestamps: true,
})
export class Like {
  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
  })
  user: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: Product.name,
    required: false,
  })
  product?: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: Comment.name,
    required: false,
  })
  comment?: Types.ObjectId;
}

export const LikeSchema = SchemaFactory.createForClass(Like);
