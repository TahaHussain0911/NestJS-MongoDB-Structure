import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from './comment.schema';
import { Model, Types } from 'mongoose';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { UserCommentPopulate } from 'src/common/populates/user.populate';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
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
      throw new BadRequestException('Comment not found!');
    }
    const { content } = updateCommentDto;
    comment.content = content;
    await comment.save();
    await comment.populate(UserCommentPopulate);
    return { comment };
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
