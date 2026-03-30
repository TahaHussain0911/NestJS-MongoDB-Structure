import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ObjectIdParam } from 'src/common/decorators/object-id.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { SwaggerJwtAuth } from 'src/utils/swagger.constants';
import { Role } from '../user/user.schema';
import { CategoryService } from './category.service';
import {
  CategoryPaginatedResponseDto,
  CategoryResponseDto,
} from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Category')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Create a category',
  })
  @ApiCreatedResponse({
    type: CategoryResponseDto,
  })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.create(createCategoryDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth(SwaggerJwtAuth)
  @ApiOperation({
    summary: 'Update a category',
  })
  @ApiOkResponse({
    type: CategoryResponseDto,
  })
  async update(
    @ObjectIdParam('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Get('all')
  @ApiOperation({
    summary: 'Get all categories',
  })
  @ApiOkResponse({
    type: CategoryPaginatedResponseDto,
  })
  async findAll(
    @Query() queryCategoryDto: QueryCategoryDto,
  ): Promise<CategoryPaginatedResponseDto> {
    return this.categoryService.findAll(queryCategoryDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single category',
  })
  @ApiOkResponse({
    type: CategoryResponseDto,
  })
  async findOne(@ObjectIdParam('id') id: string): Promise<CategoryResponseDto> {
    return this.categoryService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth(SwaggerJwtAuth)
  @ApiOperation({
    summary: 'Delete single category',
  })
  @ApiOkResponse({
    type: CategoryResponseDto,
  })
  async delete(@ObjectIdParam('id') id: string): Promise<CategoryResponseDto> {
    return this.categoryService.delete(id);
  }
}
