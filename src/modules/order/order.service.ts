import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument, OrderStatus } from './order.schema';
import mongoose, { Model, PipelineStage } from 'mongoose';
import { Product, ProductDocument } from '../product/product.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  OrderItemResponseDto,
  OrderPaginatedResponseDto,
  OrderResponseDto,
} from './dto/order-response.dto';
import { Cart, CartDocument } from '../cart/cart.schema';
import { convertStringToMongoIds, generateOrderNumber } from 'src/utils/helper';
import {
  CartProductPopulate,
  OrderProductPopulate,
} from 'src/common/populates/product.populate';
import { QueryOrderDto } from './dto/query-order.dto';
import { Role, User } from '../user/user.schema';

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
    const order = new this.orderModel({
      cart: cart._id,
      user: convertStringToMongoIds(userId),
      shippingAddress,
      totalAmount,
      orderNumber: generateOrderNumber(),
      items: orderItems.map((item) => ({
        price: item.price,
        quantity: item.quantity,
        product: item.product._id,
      })),
    });
    await order.save();
    await order.populate(OrderProductPopulate);
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
    return this.formatOrderResponse(order);
  }

  async findAll(
    queryOrderDto: QueryOrderDto,
    user: User,
  ): Promise<OrderPaginatedResponseDto> {
    const { search, status, page = 1, limit = 20 } = queryOrderDto;
    const matchStage: mongoose.QueryFilter<OrderDocument> = {
      ...(user.role === Role.USER && {
        user: user._id,
      }),
    };
    if (search) {
      matchStage.orderNumber = {
        $regex: search,
        $options: 'i',
      };
    }
    if (status) {
      matchStage.status = status;
    }
    const pipelines: PipelineStage[] = [];
    pipelines.push(
      { $match: matchStage },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            {
              $sort: {
                createdAt: -1,
              },
            },
            {
              $skip: (page - 1) * limit,
            },
            {
              $limit: limit,
            },
            {
              $lookup: {
                localField: 'items.product',
                foreignField: '_id',
                as: 'productData',
                from: 'products',
                pipeline: [
                  {
                    $project: {
                      title: 1,
                      description: 1,
                      imageUrl: 1,
                      sku: 1,
                      slug: 1,
                      stock: 1,
                      category: 1,
                    },
                  },
                  {
                    $lookup: {
                      localField: 'category',
                      foreignField: '_id',
                      from: 'categories',
                      as: 'category',
                      pipeline: [
                        {
                          $project: {
                            title: 1,
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                items: {
                  $map: {
                    input: '$items',
                    as: 'item', //as gives name to each elem like .map((item)=>item)
                    in: {
                      //in tells what the output will look like
                      quantity: '$$item.quantity',
                      price: '$$item.price',
                      product: {
                        $first: {
                          //$first returns first element
                          $filter: {
                            input: '$productData',
                            as: 'prod',
                            cond: { $eq: ['$$prod._id', '$$item.product'] },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            {
              $project: {
                productData: 0,
              },
            },
          ],
        },
      },
    );
    const [result] = await this.orderModel.aggregate(pipelines);
    const total = result?.metadata?.[0]?.total || 0;
    return {
      page,
      total,
      totalPages: Math.ceil(total / limit),
      data: result?.data || [],
    };
  }

  async findOne(orderId: string, user: User): Promise<OrderResponseDto> {
    const order = await this.orderModel
      .findOne({
        _id: orderId,
        ...(user.role === Role.USER && {
          user: user._id,
        }),
      })
      .populate(OrderProductPopulate);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return this.formatOrderResponse(order);
  }

  async cancel(orderId: string, user: User): Promise<OrderResponseDto> {
    const order = await this.orderModel
      .findOne({
        _id: orderId,
        ...(user.role === Role.USER && {
          user: user._id,
        }),
      })
      .populate(OrderProductPopulate)
      .lean();
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(`Only pending order can be cancelled`);
    }
    for (const item of order.items) {
      await this.productModel.updateOne(
        {
          _id: item.product._id,
        },
        {
          $inc: {
            stock: item.quantity,
          },
        },
      );
    }
    order.status = OrderStatus.CANCELLED;
    await order.save();
    return this.formatOrderResponse(order);
  }

  private formatOrderResponse(order: OrderDocument): OrderResponseDto {
    return {
      order: order.toObject(),
    };
  }
}
