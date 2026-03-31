import { ApiProperty } from '@nestjs/swagger';
import { Cart } from '../cart.schema';
import { Product } from 'src/modules/product/product.schema';

export class CartItemsResponseDto {
  @ApiProperty()
  product: Product;

  @ApiProperty()
  quantity: number;
}

export class CartResponseDto {
  @ApiProperty()
  cart: Omit<Cart, 'items'> & { items: CartItemsResponseDto[] };
}
