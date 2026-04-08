import { Category } from 'src/modules/category/category.schema';
import { Product } from '../product.schema';
import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from 'src/common/dto/pagination-response.dto';

export class ProductResponseDto {
  @ApiProperty({
    type: Product,
  })
  product: Product;
}

export class ProductPaginatedResponseDto extends PaginatedResponseDto {
  @ApiProperty({
    type: [ProductResponseDto['product']],
  })
  data: ProductResponseDto['product'][];
}
