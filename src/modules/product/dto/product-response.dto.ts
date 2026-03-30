import { Category } from 'src/modules/category/category.schema';
import { Product } from '../product.schema';
import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({
    type: Product,
  })
  product: Product;
}

export class ProductPaginatedResponseDto {
  @ApiProperty()
  data: ProductResponseDto['product'][];

  @ApiProperty()
  page: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;
}
