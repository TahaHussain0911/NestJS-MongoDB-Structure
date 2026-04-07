import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, Types } from 'mongoose';
import { User } from '../user/user.schema';

export type RoomDocument = Room & Document;

@Schema({
  timestamps: true,
})
export class Room {
  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId;

  @Prop({
    type: [
      {
        type: Types.ObjectId,
        ref: User.name,
      },
    ],
    required: true,
  })
  participants: Types.ObjectId[];
}

export const RoomSchema = SchemaFactory.createForClass(Room);
