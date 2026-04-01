import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RefreshTokenGuard } from 'src/common/guards/refresh-token.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { SwaggerJwtAuth } from 'src/utils/swagger.constants';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '../user/user.schema';
import { CreateProductDto } from './dto/create-product.dto';
import {
  ProductPaginatedResponseDto,
  ProductResponseDto,
} from './dto/product-response.dto';
import { ObjectIdParam } from 'src/common/decorators/object-id.decorator';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth(SwaggerJwtAuth)
  @ApiOperation({
    summary: 'Create a product [Admin only]',
  })
  @ApiCreatedResponse({
    type: ProductResponseDto,
  })
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productService.create(createProductDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth(SwaggerJwtAuth)
  @ApiOperation({
    summary: 'Update a product [Admin only]',
  })
  @ApiCreatedResponse({
    type: ProductResponseDto,
  })
  async update(
    @ObjectIdParam('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productService.update(id, updateProductDto);
  }

  @Patch('stock/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth(SwaggerJwtAuth)
  @ApiOperation({
    summary: 'Increment/decrement a product stock',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        stock: {
          type: 'number',
        },
      },
      required: ['stock'],
    },
  })
  @ApiCreatedResponse({
    type: ProductResponseDto,
  })
  async updateStock(
    @ObjectIdParam('id') id: string,
    @Body('stock') stock: number,
  ): Promise<ProductResponseDto> {
    return this.productService.updateStock(id, stock);
  }

  @Get('all')
  @ApiOperation({
    summary: 'Get all product',
  })
  @ApiOkResponse({
    type: ProductPaginatedResponseDto,
  })
  async findAll(
    @Query() queryProductDto: QueryProductDto,
  ): Promise<ProductPaginatedResponseDto> {
    return this.productService.findAll(queryProductDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get product details',
  })
  @ApiCreatedResponse({
    type: ProductResponseDto,
  })
  async findOne(@ObjectIdParam('id') id: string): Promise<ProductResponseDto> {
    return this.productService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth(SwaggerJwtAuth)
  @ApiOperation({
    summary: 'Delete a product',
  })
  @ApiCreatedResponse({
    type: ProductResponseDto,
  })
  async delete(@ObjectIdParam('id') id: string): Promise<ProductResponseDto> {
    return this.productService.delete(id);
  }
}
