import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../category.schema';
import { PaginatedResponseDto } from 'src/common/dto/pagination-response.dto';

export class CategoryResponseDto {
  @ApiProperty({
    type: Category,
  })
  category: Category;
}

export class CategoryPaginatedResponseDto extends PaginatedResponseDto {
  @ApiProperty({
    type: [CategoryResponseDto['category']],
  })
  data: CategoryResponseDto['category'][];
}
