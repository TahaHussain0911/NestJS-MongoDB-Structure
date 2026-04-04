import { ApiProperty } from '@nestjs/swagger';
import { Comment } from '../comment.schema';

export class CommentResponseDto {
  @ApiProperty({
    type: Comment,
  })
  comment: Comment;
}
