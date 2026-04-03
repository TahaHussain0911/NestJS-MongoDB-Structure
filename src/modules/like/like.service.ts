import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserLikePopulate } from 'src/common/populates/user.populate';
import { convertStringToMongoIds } from 'src/utils/helper';
import { Comment, CommentDocument } from '../comment/comment.schema';
import { Product, ProductDocument } from '../product/product.schema';
import { LikeResponseDto } from './dto/like-response.dto';
import { Like, LikeDocument } from './like.schema';

@Injectable()
export class LikeService {
  constructor(
    @InjectModel(Like.name) private readonly likeModel: Model<LikeDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
  ) {}

  async likeUnlikeProduct(
    userId: string,
    productId: string,
  ): Promise<LikeResponseDto> {
    const product = await this.productModel
      .findById(productId)
      .select('likesCount');
    if (!product) {
      throw new BadRequestException('Product not found!');
    }
    const alreadyLiked = await this.likeModel.exists({
      user: userId,
      product: product._id,
    });
    const INC_DEC = alreadyLiked ? -1 : 1;
    if (alreadyLiked) {
      await this.likeModel.deleteOne({
        _id: alreadyLiked._id,
      });
    } else {
      await this.likeModel.create({
        user: userId,
        product: product._id,
      });
    }
    await this.productModel.updateOne(
      { _id: product._id },
      {
        $inc: {
          likesCount: INC_DEC,
        },
      },
    );
    return {
      productId,
      likesCount: product.likesCount + INC_DEC,
      hasLiked: !alreadyLiked,
    };
  }

  async likeUnlikeComment(
    userId: string,
    commentId: string,
  ): Promise<LikeResponseDto> {
    const comment = await this.commentModel
      .findById(commentId)
      .select('likesCount');
    if (!comment) {
      throw new BadRequestException('Comment not found');
    }
    const alreadyLiked = await this.likeModel.exists({
      user: userId,
      comment: comment._id,
    });
    const INC_DEC = alreadyLiked ? -1 : 1;
    if (alreadyLiked) {
      await this.likeModel.deleteOne({
        _id: alreadyLiked._id,
      });
    } else {
      await this.likeModel.create({
        user: userId,
        comment: comment._id,
      });
    }
    await this.commentModel.updateOne(
      {
        _id: comment._id,
      },
      {
        $inc: {
          likesCount: INC_DEC,
        },
      },
    );
    return {
      commentId,
      likesCount: comment.likesCount + INC_DEC,
      hasLiked: !alreadyLiked,
    };
  }

  async getProductLikes(productId: string): Promise<Omit<Like, 'comment'>[]> {
    const productLikes = await this.likeModel
      .find({
        product: convertStringToMongoIds(productId),
      })
      .select({
        comment: 0,
      })
      .sort({
        createdAt: -1,
      })
      .populate(UserLikePopulate);
    return productLikes;
  }

  async getCommentLikes(commentId: string): Promise<Omit<Like, 'product'>[]> {
    const commentLikes = await this.likeModel
      .find({
        comment: convertStringToMongoIds(commentId),
      })
      .select({
        product: 0,
      })
      .sort({
        createdAt: -1,
      })
      .populate(UserLikePopulate);
    return commentLikes;
  }
}
