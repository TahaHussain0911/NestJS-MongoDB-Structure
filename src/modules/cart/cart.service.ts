import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cart, CartDocument } from './cart.schema';
import { Product, ProductDocument } from '../product/product.schema';
import { Model, Types } from 'mongoose';
import { convertStringToMongoIds } from 'src/utils/helper';
import { CartResponseDto } from './dto/cart-response.dto';
import { UpsertCartItemDto } from './dto/upsert-cart-item.dto';
import { CartProductPopulate } from 'src/common/populates/product.populate';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async getCart(userId: string): Promise<CartResponseDto> {
    const cart = await this.getOrCreateCart(userId);
    return this.formatCartResponse(cart);
  }

  async upsertItem(
    userId: string,
    upsertCartItemDto: UpsertCartItemDto,
  ): Promise<CartResponseDto> {
    const cart = await this.getOrCreateCart(userId);

    const { productId, quantity } = upsertCartItemDto;
    const cartItemIndex = cart.items.findIndex(
      (item) => String(item.product?._id) === productId,
    );

    if (cartItemIndex !== -1) {
      const product = cart.items[cartItemIndex].product as unknown as Product;
      if (product.stock < quantity) {
        throw new BadRequestException(
          `Insufficient product stock. Available ${product.stock}, Requested ${quantity}`,
        );
      }
      cart.items[cartItemIndex].quantity = quantity;
    } else {
      const product = await this.productModel.findById(productId);
      if (!product) {
        throw new BadRequestException('Product not found!');
      }
      if (product.stock < quantity) {
        throw new BadRequestException(
          `Insufficient product stock. Available ${product.stock}, Requested ${quantity}`,
        );
      }
      cart.items.push({
        product: product._id,
        quantity,
        price: product.price,
      });
    }

    await cart.save();
    await cart.populate(CartProductPopulate);

    return this.formatCartResponse(cart);
  }

  async removeCartItem(
    userId: string,
    productId: string,
  ): Promise<CartResponseDto> {
    const cart = await this.getOrCreateCart(userId);
    const cartItems = cart.items.filter(
      (item) => String(item.product._id) !== productId,
    );
    cart.items = cartItems;
    await cart.save();
    return this.formatCartResponse(cart);
  }

  async clearCart(userId: string): Promise<CartResponseDto> {
    const cart = await this.getOrCreateCart(userId);
    cart.items = [];
    await cart.save();
    return this.formatCartResponse(cart);
  }

  private async getOrCreateCart(userId: string): Promise<CartDocument> {
    let cart = await this.cartModel
      .findOne({
        user: convertStringToMongoIds(userId),
        checkedOut: false,
      })
      .populate(CartProductPopulate);
    console.log(cart, 'cart');
    if (!cart) {
      cart = await this.cartModel.create({
        user: convertStringToMongoIds(userId),
      });
    }

    return cart;
  }

  private formatCartResponse(cart: CartDocument): CartResponseDto {
    return {
      cart: cart.toObject(),
    };
  }
}
