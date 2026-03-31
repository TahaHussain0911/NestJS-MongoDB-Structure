import { Product } from 'src/modules/product/product.schema';
import { Order } from '../order.schema';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemResponseDto {
  product: Product;
  quantity: number;
  price: number;
}

export class OrderResponseDto {
  order: Omit<Order, 'items'> & { items: OrderItemResponseDto[] };
}

export class OrderPaginatedResponseDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  data: OrderResponseDto['order'][];
}
