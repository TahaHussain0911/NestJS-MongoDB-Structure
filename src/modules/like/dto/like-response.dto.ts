import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LikeResponseDto {
  @ApiProperty()
  likesCount: number;

  @ApiPropertyOptional()
  commentId?: string;

  @ApiPropertyOptional()
  productId?: string;

  @ApiProperty()
  hasLiked: boolean;
}
