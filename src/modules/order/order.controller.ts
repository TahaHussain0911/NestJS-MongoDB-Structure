import { Body, Controller, Post, UseGuards } from '@nestjs/common';
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
import { OrderResponseDto } from './dto/order-response.dto';

@ApiTags('Orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth(SwaggerJwtAuth)
@Controller('order')
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
}
