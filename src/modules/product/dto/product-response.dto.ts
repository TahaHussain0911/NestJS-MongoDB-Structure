import { Category } from 'src/modules/category/category.schema';
import { Product } from '../product.schema';

export class ProductResponseDto {
  product: Product;
}

export class ProductPaginatedResponseDto {
  data: ProductResponseDto['product'][];
  page: number;
  total: number;
  totalPages: number;
}
