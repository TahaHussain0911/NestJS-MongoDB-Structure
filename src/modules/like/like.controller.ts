import { Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { LikeService } from './like.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { LikeResponseDto } from './dto/like-response.dto';
import { ObjectIdParam } from 'src/common/decorators/object-id.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { SwaggerJwtAuth } from 'src/utils/swagger.constants';
import { Like } from './like.schema';

@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Patch('products/:productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(SwaggerJwtAuth)
  @ApiOperation({
    summary: 'Like/unlike a product',
  })
  @ApiOkResponse({
    type: LikeResponseDto,
  })
  async likeUnlikeProduct(
    @GetUser('_id') userId: string,
    @ObjectIdParam('productId') productId: string,
  ): Promise<LikeResponseDto> {
    return this.likeService.likeUnlikeProduct(userId, productId);
  }

  @Patch('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(SwaggerJwtAuth)
  @ApiOperation({
    summary: 'Like/unlike a comment',
  })
  @ApiOkResponse({
    type: LikeResponseDto,
  })
  async likeUnlikeComment(
    @GetUser('_id') userId: string,
    @ObjectIdParam('commentId') commentId: string,
  ): Promise<LikeResponseDto> {
    return this.likeService.likeUnlikeComment(userId, commentId);
  }

  @Get('products/:productId')
  @ApiOperation({
    summary: 'Get product likes',
  })
  @ApiOkResponse({
    type: [Like],
  })
  async getProductLikes(
    @ObjectIdParam('productId') productId: string,
  ): Promise<Omit<Like, 'comment'>[]> {
    return this.likeService.getProductLikes(productId);
  }

  @Get('comments/:commentId')
  @ApiOperation({
    summary: 'Get comment likes',
  })
  @ApiOkResponse({
    type: [Like],
  })
  async getCommentLikes(
    @ObjectIdParam('commentId') commentId: string,
  ): Promise<Omit<Like, 'product'>[]> {
    return this.likeService.getCommentLikes(commentId);
  }
}
