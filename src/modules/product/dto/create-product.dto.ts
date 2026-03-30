import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { DTOBoolean, DTOTrim } from 'src/utils/helper';

export class CreateProductDto {
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

  @ApiProperty()
  @IsString()
  @Transform(DTOTrim)
  @IsNotEmpty()
  @MaxLength(50)
  sku: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  stock: number;

  @ApiProperty()
  @IsMongoId()
  categoryId: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(1)
  price: number;

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
