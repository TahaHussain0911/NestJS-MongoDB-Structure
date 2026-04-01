import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { SwaggerJwtAuth } from 'src/utils/swagger.constants';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import {
  OrderPaginatedResponseDto,
  OrderResponseDto,
} from './dto/order-response.dto';
import { Role, User } from '../user/user.schema';
import { Roles } from 'src/common/decorators/roles.decorator';
import { QueryOrderDto } from './dto/query-order.dto';

@ApiTags('Orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth(SwaggerJwtAuth)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create')
  @ApiOperation({
    summary: 'Create an order',
  })
  @ApiCreatedResponse({
    type: OrderResponseDto,
  })
  async create(
    @GetUser('_id') userId: string,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    return this.orderService.create(userId, createOrderDto);
  }

  @Get('all')
  @ApiOperation({
    summary: 'Get all orders',
  })
  @ApiOkResponse({
    type: OrderPaginatedResponseDto,
  })
  async findAll(
    @Query() queryOrderDto: QueryOrderDto,
    @GetUser() user: User,
  ): Promise<OrderPaginatedResponseDto> {
    return this.orderService.findAll(queryOrderDto, user);
  }

  @Get(':orderId')
  @ApiOperation({
    summary: 'Get single order details',
  })
  @ApiOkResponse({
    type: OrderResponseDto,
  })
  async findOne(
    @Param('orderId') orderId: string,
    @GetUser() user: User,
  ): Promise<OrderResponseDto> {
    return this.orderService.findOne(orderId, user);
  }

  @Patch('cancel/:orderId')
  @ApiOperation({
    summary: 'Get single order details',
  })
  @ApiOkResponse({
    type: OrderResponseDto,
  })
  async cancel(
    @Param('orderId') orderId: string,
    @GetUser() user: User,
  ): Promise<OrderResponseDto> {
    return this.orderService.cancel(orderId, user);
  }
}
