import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model, PipelineStage } from 'mongoose';
import { Category, CategoryDocument } from './category.schema';
import { InjectModel } from '@nestjs/mongoose';
import {
  CategoryPaginatedResponseDto,
  CategoryResponseDto,
} from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { convertStringToMongoIds, createSlug } from 'src/utils/helper';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { Product, ProductDocument } from '../product/product.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const { title, ...rest } = createCategoryDto;
    const slug = await this.getCategoryBySlug(title);
    const category = await this.categoryModel.create({
      title,
      slug,
      ...rest,
    });
    return { category };
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    const { title, ...rest } = updateCategoryDto;
    if (title && category.title !== title) {
      category.title = title;
      category.slug = await this.getCategoryBySlug(title);
    }
    Object.assign(category, rest);
    await category.save();
    return {
      category,
    };
  }

  async findAll(
    queryCategoryDto: QueryCategoryDto,
  ): Promise<CategoryPaginatedResponseDto> {
    const { search, page = 1, limit = 20 } = queryCategoryDto;
    const pipelines: PipelineStage[] = [];
    if (search) {
      pipelines.push({
        $match: {
          $or: [
            {
              title: {
                $regex: search,
                $options: 'i',
              },
            },
            {
              description: {
                $regex: search,
                $options: 'i',
              },
            },
          ],
        },
      });
    }
    pipelines.push({
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
        ],
      },
    });
    const [result] = await this.categoryModel.aggregate(pipelines);
    const total = result?.metadata?.[0].total || 0;
    return {
      page,
      total,
      totalPages: Math.ceil(total / limit),
      data: result?.data,
    };
  }

  async findOne(id: string): Promise<CategoryResponseDto> {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return {
      category,
    };
  }

  async delete(id: string): Promise<CategoryResponseDto> {
    const categoryInProd = await this.productModel.exists({
      category: convertStringToMongoIds(id),
    });
    if (categoryInProd) {
      throw new BadRequestException(
        'Category exists inside a product. You can deactivate it',
      );
    }
    const category = await this.categoryModel.findByIdAndDelete(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return { category };
  }

  async getCategoryBySlug(title: string): Promise<string> {
    const slug = createSlug(title);
    const slugTaken = await this.categoryModel.exists({ slug });
    if (slugTaken) {
      throw new ConflictException(`Category already exists`);
    }
    return slug;
  }
}
