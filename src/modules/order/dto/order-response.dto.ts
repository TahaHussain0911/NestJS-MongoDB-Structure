import { Product } from 'src/modules/product/product.schema';
import { Order } from '../order.schema';

export class OrderItemResponseDto {
  product: Product;
  quantity: number;
  price: number;
}

export class OrderResponseDto {
  order: Omit<Order, 'items'> & { items: OrderItemResponseDto[] };
}
