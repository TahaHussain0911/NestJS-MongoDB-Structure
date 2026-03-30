import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { DTOBoolean, DTOTrim } from 'src/utils/helper';

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  @Transform(DTOTrim)
  @IsNotEmpty()
  @MaxLength(50)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(DTOTrim)
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(DTOBoolean)
  isActive?: boolean;
}
