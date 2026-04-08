import { Product } from 'src/modules/product/product.schema';
import { Order } from '../order.schema';
import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from 'src/common/dto/pagination-response.dto';

export class OrderItemResponseDto {
  product: Product;
  quantity: number;
  price: number;
}

export class OrderResponseDto {
  order: Omit<Order, 'items'> & { items: OrderItemResponseDto[] };
}

export class OrderPaginatedResponseDto extends PaginatedResponseDto {
  @ApiProperty({
    type: [OrderResponseDto['order']],
  })
  data: OrderResponseDto['order'][];
}
