import { Module } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Like, LikeSchema } from './like.schema';
import { ProductModule } from '../product/product.module';
import { CommentModule } from '../comment/comment.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Like.name,
        schema: LikeSchema,
      },
    ]),
    ProductModule,
    CommentModule,
  ],
  controllers: [LikeController],
  providers: [LikeService],
})
export class LikeModule {}
