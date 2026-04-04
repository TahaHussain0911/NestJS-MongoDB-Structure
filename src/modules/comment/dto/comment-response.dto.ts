import { ApiProperty } from '@nestjs/swagger';
import { Comment } from '../comment.schema';
import { Types } from 'mongoose';
import { Role } from 'src/modules/user/user.schema';

export class CommentResponseDto {
  @ApiProperty({
    type: Comment,
  })
  comment: Comment;
}

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  photo: string;
  role: Role;
}

export interface IComment {
  _id: Types.ObjectId;
  product: Types.ObjectId;
  user: IUser;
  content: string;
  parent: Types.ObjectId | null;
  likesCount: number;
  replyCount: number;
  createdAt: Date;
  updatedAt: Date;
  children?: IComment[];
}
