import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DTOTrim } from 'src/utils/helper';

export class CreateMessageDto {
  @ApiProperty()
  @IsString()
  @Transform(DTOTrim)
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(DTOTrim)
  attachment?: string;
}
