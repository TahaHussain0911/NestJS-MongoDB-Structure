import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { DTOTrim } from 'src/utils/helper';

export class QueryRoomDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(DTOTrim)
  search?: string;
}
