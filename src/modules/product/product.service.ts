import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './product.schema';
import { Model, PipelineStage } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import {
  ProductPaginatedResponseDto,
  ProductResponseDto,
} from './dto/product-response.dto';
import { createSlug } from 'src/utils/helper';
import { Category, CategoryDocument } from '../category/category.schema';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async create(
    createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    const { title, categoryId, ...rest } = createProductDto;
    await this.validateProductSku(rest.sku);
    const slug = await this.getProductBySlug(title);
    const category = await this.getProductCategory(categoryId);
    const product = await this.productModel.create({
      title,
      slug,
      category: category._id,
      ...rest,
    });
    return {
      product,
    };
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found!');
    }
    const { title, categoryId, sku, ...rest } = updateProductDto;
    if (title && product.title !== title) {
      product.slug = await this.getProductBySlug(title, id);
      product.title = title;
    }
    if (categoryId && String(product.category) !== categoryId) {
      product.category = (await this.getProductCategory(categoryId))?._id;
    }
    if (sku && product.sku !== sku) {
      await this.validateProductSku(sku, id);
      product.sku = sku;
    }
    Object.assign(product, rest);
    await product.save();
    return {
      product,
    };
  }

  async updateStock(id: string, stock: number): Promise<ProductResponseDto> {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    const newStock = product.stock + stock;
    if (newStock < 0) {
      throw new BadRequestException(`Insufficient stock`);
    }
    product.stock = newStock;
    await product.save();
    return {
      product,
    };
  }

  async findAll(
    queryProductDto: QueryProductDto,
  ): Promise<ProductPaginatedResponseDto> {
    const { search, page = 1, limit = 20 } = queryProductDto;
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
          {
            $lookup: {
              localField: 'category',
              foreignField: '_id',
              from: 'categories',
              as: 'category',
            },
          },
          {
            $unwind: {
              path: '$category',
              preserveNullAndEmptyArrays: true,
            },
          },
        ],
      },
    });
    const [result] = await this.productModel.aggregate(pipelines);
    const total = result?.metadata?.[0].total || 0;
    return {
      page,
      totalPages: Math.ceil(total / limit),
      total,
      data: result?.data,
    };
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.productModel
      .findById(id)
      .populate('category')
      .lean();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return {
      product,
    };
  }

  async delete(id: string): Promise<ProductResponseDto> {
    const product = await this.productModel.findByIdAndDelete(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return {
      product,
    };
  }

  async getProductBySlug(title: string, excludeId?: string): Promise<string> {
    const slug = createSlug(title);
    const slugTaken = await this.productModel.exists({
      slug,
      _id: { $ne: excludeId },
    });
    if (slugTaken) {
      throw new ConflictException('Product title already exists');
    }
    return slug;
  }

  async getProductCategory(categoryId: string) {
    const category = await this.categoryModel.findById(categoryId).lean();
    if (!category) {
      throw new BadRequestException('Category not found');
    }
    return category;
  }

  async validateProductSku(sku: string, excludeId?: string): Promise<void> {
    const skuTaken = await this.productModel.exists({
      sku,
      _id: { $ne: excludeId },
    });
    if (skuTaken) {
      throw new ConflictException('Product sku already exists');
    }
  }
}
