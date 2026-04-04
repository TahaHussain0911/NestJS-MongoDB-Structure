import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { CommentResponseDto } from './dto/comment-response.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { SwaggerJwtAuth } from 'src/utils/swagger.constants';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(SwaggerJwtAuth)
  @ApiOperation({ summary: 'Create a comment' })
  @ApiCreatedResponse({
    type: CommentResponseDto,
  })
  async create(
    @GetUser('_id') userId: string,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    return this.commentService.create(userId, createCommentDto);
  }

  @Patch(':commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(SwaggerJwtAuth)
  @ApiOperation({ summary: 'Update a comment' })
  @ApiCreatedResponse({
    type: CommentResponseDto,
  })
  async update(
    @GetUser('_id') userId: string,
    @Param('commentId') commentId: string,
    @Body() updatecommentDto: UpdateCommentDto,
  ): Promise<CommentResponseDto> {
    return this.commentService.update(userId, commentId, updatecommentDto);
  }
}
