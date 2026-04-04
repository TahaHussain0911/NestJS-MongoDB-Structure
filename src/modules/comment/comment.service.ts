import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from './comment.schema';
import { Connection, Model, Types } from 'mongoose';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentResponseDto, IComment } from './dto/comment-response.dto';
import { UserCommentPopulate } from 'src/common/populates/user.populate';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { convertStringToMongoIds } from 'src/utils/helper';
import { QueryCommentDto } from './dto/query-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
    private readonly connection: Connection,
  ) {}

  async create(
    userId: string,
    createCommentDto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    const { content, productId, parentId } = createCommentDto;
    const product = await this.commentModel.findById(productId);
    if (!product) {
      throw new BadRequestException('Product not found');
    }
    const createdComment = new this.commentModel({
      user: userId,
      content,
      product: productId,
    });
    if (parentId) {
      createdComment.parent = await this.validateCommentParent(parentId);
    }
    await createdComment.save();
    await createdComment.populate(UserCommentPopulate);
    return {
      comment: createdComment,
    };
  }

  async update(
    userId: string,
    commentId: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentModel.findOne({
      _id: commentId,
      user: userId,
    });
    if (!comment) {
      throw new NotFoundException('Comment not found!');
    }
    const { content } = updateCommentDto;
    comment.content = content;
    await comment.save();
    await comment.populate(UserCommentPopulate);
    return { comment };
  }

  async delete(userId: string, commentId: string): Promise<CommentResponseDto> {
    const comment = await this.commentModel.findOne({
      _id: commentId,
      user: userId,
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      await this.commentModel.deleteMany({
        parent: convertStringToMongoIds(commentId),
      });
      await this.commentModel.deleteOne({
        _id: commentId,
      });
      if (comment.parent) {
        await this.commentModel.updateOne(
          { _id: comment.parent },
          {
            $inc: {
              replyCount: -1,
            },
          },
        );
      }
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
    return {
      comment,
    };
  }

  async getAllProductComments(
    productId: string,
    queryCommentDto: QueryCommentDto,
  ) {
    const comments = (await this.commentModel
      .find({
        product: convertStringToMongoIds(productId),
      })
      .sort({
        likesCount: -1,
      })
      .populate(UserCommentPopulate)
      .lean()) as unknown as IComment[];
    const { page = 1, limit = 20 } = queryCommentDto;
    const result = this.transformCommentHierarchy(comments, page, limit);
    return result;
  }

  private transformCommentHierarchy(
    comments: IComment[],
    page: number,
    limit: number,
  ) {
    const map = new Map<string, IComment>();

    comments.forEach((c) => {
      c.children = [];
      map.set(String(c._id), c);
    });

    const roots: IComment[] = [];

    comments.forEach((c) => {
      if (c.parent) {
        const parent = map.get(String(c.parent));
        if (parent) {
          parent.children?.push(c);
        }
      } else {
        roots.push(c);
      }
    });
    const totalTopLevel = roots.length;
    const totalPages = Math.ceil(totalTopLevel / limit);
    const paginatedComments = roots.slice((page - 1) * limit, page * limit);
    return {
      total: totalTopLevel,
      totalPages,
      comments: paginatedComments,
    };
  }

  private async validateCommentParent(
    parentId: string,
  ): Promise<Types.ObjectId> {
    const comment = await this.commentModel.findByIdAndUpdate(parentId, {
      $inc: {
        replyCount: 1,
      },
    });
    if (!comment) {
      throw new BadRequestException('Parent comment not found!');
    }
    return comment._id;
  }
}
