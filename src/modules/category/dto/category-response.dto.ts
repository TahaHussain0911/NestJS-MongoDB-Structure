import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../category.schema';

export class CategoryResponseDto {
  @ApiProperty({
    type: Category,
  })
  category: Category;
}

export class CategoryPaginatedResponseDto {
  @ApiProperty()
  data: CategoryResponseDto['category'][];

  @ApiProperty()
  page: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;
}
