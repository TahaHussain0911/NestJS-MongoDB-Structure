import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { SwaggerJwtAuth } from 'src/utils/swagger.constants';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { CartResponseDto } from './dto/cart-response.dto';
import { UpsertCartItemDto } from './dto/upsert-cart-item.dto';

@ApiTags('Cart')
@ApiBearerAuth(SwaggerJwtAuth)
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({
    summary: 'Get current user cart',
  })
  @ApiOkResponse({
    type: CartResponseDto,
  })
  async getCart(@GetUser('_id') userId: string): Promise<CartResponseDto> {
    return this.cartService.getCart(userId);
  }

  @Patch('items')
  @ApiOperation({
    summary: 'Upsert an item to current user cart',
  })
  @ApiOkResponse({
    type: CartResponseDto,
  })
  async upsertItem(
    @GetUser('_id') userId: string,
    @Body() upsertCartItemDto: UpsertCartItemDto,
  ): Promise<CartResponseDto> {
    return this.cartService.upsertItem(userId, upsertCartItemDto);
  }

  @Delete('items/:productId')
  @ApiOperation({
    summary: 'Remove an item from current user cart',
  })
  @ApiOkResponse({
    type: CartResponseDto,
  })
  async removeCartItem(
    @GetUser('_id') userId: string,
    @Param('productId') productId: string,
  ): Promise<CartResponseDto> {
    return this.cartService.removeCartItem(userId, productId);
  }

  @Delete()
  @ApiOperation({
    summary: 'Clear a current user cart',
  })
  @ApiOkResponse({
    type: CartResponseDto,
  })
  async clearCart(@GetUser('_id') userId: string): Promise<CartResponseDto> {
    return this.cartService.clearCart(userId);
  }
}
