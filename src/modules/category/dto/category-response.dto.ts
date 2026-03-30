import { Category } from '../category.schema';

export class CategoryResponseDto {
  category: Category;
}

export class CategoryPaginatedResponseDto {
  data: Category[];
  page: number;
  total: number;
  totalPages: number;
}
