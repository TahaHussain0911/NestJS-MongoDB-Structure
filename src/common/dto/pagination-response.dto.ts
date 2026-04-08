import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;
}
