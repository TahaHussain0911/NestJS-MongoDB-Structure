import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, Types } from 'mongoose';
import { User } from '../user/user.schema';
import { Room } from '../room/room.schema';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId;

  @Prop({
    required: true,
  })
  content: string;

  @Prop({
    required: false,
    default: null,
  })
  attachment?: string;

  @Prop({
    type: [
      {
        type: Types.ObjectId,
        ref: User.name,
      },
    ],
    required: true,
  })
  readBy: Types.ObjectId[];

  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
  })
  sender: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: Room.name,
    required: true,
  })
  room: Types.ObjectId;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
