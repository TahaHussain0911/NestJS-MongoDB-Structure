import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { DTOTrim } from 'src/utils/helper';

export class QueryUserDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(DTOTrim)
  search?: string;
}
