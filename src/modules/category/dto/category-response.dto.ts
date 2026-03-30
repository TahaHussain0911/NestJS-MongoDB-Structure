import { Category } from '../category.schema';

export class CategoryResponseDto {
  category: Category;
}

export class CategoryPaginatedResponseDto {
  data: CategoryResponseDto['category'][];
  page: number;
  total: number;
  totalPages: number;
}
