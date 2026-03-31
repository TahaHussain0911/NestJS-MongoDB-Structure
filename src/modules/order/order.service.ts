import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './order.schema';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../product/product.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  OrderItemResponseDto,
  OrderResponseDto,
} from './dto/order-response.dto';
import { Cart, CartDocument } from '../cart/cart.schema';
import { convertStringToMongoIds } from 'src/utils/helper';
import { CartProductPopulate } from 'src/common/populates/product.populate';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,
  ) {}

  async create(
    userId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    const { shippingAddress } = createOrderDto;
    const orderItems: OrderItemResponseDto[] = [];
    const cart = await this.cartModel
      .findOne({
        user: convertStringToMongoIds(userId),
        checkedOut: false,
      })
      .populate(CartProductPopulate);
    if (!cart || !cart.items.length) {
      throw new BadRequestException('Cart is empty');
    }
    for (const item of cart.items) {
      const product = item.product as unknown as Product;
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient product quantity. Requested ${item.quantity}, Available ${product.stock}`,
        );
      }
      if (product.price > item.price) {
        throw new BadRequestException(
          `Price for product ${product.title} is changed from ${item.price} to ${product.price}`,
        );
      }
      orderItems.push({
        quantity: item.quantity,
        price: item.price,
        product,
      });
    }
    const totalAmount = orderItems.reduce((acc, item) => {
      return acc + item.price * item.quantity;
    }, 0);
    const order = await this.orderModel.create({
      user: convertStringToMongoIds(userId),
      shippingAddress,
      totalAmount,
      items: orderItems.map((item) => ({
        price: item.price,
        quantity: item.quantity,
        product: item.product._id,
      })),
    });
    for (const item of orderItems) {
      await this.productModel.updateOne(
        {
          _id: item.product._id,
        },
        {
          $inc: {
            stock: -item.quantity,
          },
        },
      );
    }
    return {
      order: {
        ...order,
        items: orderItems,
      },
    };
  }
}
