import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, Types } from 'mongoose';

export type CommentDocument = Comment & Document;

@Schema({
  timestamps: true,
})
export class Comment {
  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId;

  @Prop({
    default: 0,
  })
  likesCount: number;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
