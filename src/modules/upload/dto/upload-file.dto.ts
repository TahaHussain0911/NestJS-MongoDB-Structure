import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class FileMetadataDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fileType: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  fileSize: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fileName: string;
}

export class UploadFilesDto {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  keys?: string[];
}

export class SignedUrlDto {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  keys?: string[];

  @ApiProperty({ type: [FileMetadataDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileMetadataDto)
  files: FileMetadataDto[];
}
