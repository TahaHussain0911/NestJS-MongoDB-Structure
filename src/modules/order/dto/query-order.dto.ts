import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { DTOTrim } from 'src/utils/helper';
import { OrderStatus } from '../order.schema';

export class QueryOrderDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(DTOTrim)
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum({
    enum: OrderStatus,
  })
  status?: OrderStatus;
}
