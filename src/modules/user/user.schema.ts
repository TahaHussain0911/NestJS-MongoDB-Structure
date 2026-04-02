import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, type ObjectId } from 'mongoose';

export type UserDocument = User & Document;

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}

@Schema({
  timestamps: true,
})
export class User {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({
    required: true,
  })
  name: string;

  @Prop({
    default: null,
  })
  photo?: string;

  @Prop({
    required: true,
    unique: true,
  })
  email: string;

  @Prop({
    required: true,
    select: false,
  })
  password: string;

  @Prop({
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Prop({
    default: null,
    select: false,
  })
  refreshId?: string;

  @Prop({
    default: null,
    select: false,
  })
  otp?: string;

  @Prop({
    default: null,
    select: false,
  })
  otpExpires?: Date;

  @Prop({
    default: false,
    select: false,
  })
  otpVerified: boolean;

  @Prop({
    default: null,
    select: false,
  })
  passwordChangedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
