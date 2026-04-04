import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty()
  @IsMongoId()
  productId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  parentId?: string;
}
