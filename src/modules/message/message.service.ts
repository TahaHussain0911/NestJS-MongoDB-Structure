import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, PipelineStage, Types } from 'mongoose';
import { MessageUsersPopulate } from 'src/common/populates/message.populate';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message, MessageDocument } from './message.schema';
import { MessagePaginatedResponseDto } from './dto/message-response.dto';
import { QueryMessageDto } from './dto/query-message.dto';
import { convertStringToMongoIds } from 'src/utils/helper';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
  ) {}

  async create(
    userId: string,
    roomId: Types.ObjectId,
    createMessageDto: CreateMessageDto,
  ): Promise<Message> {
    const { content, attachment } = createMessageDto;
    const message = new this.messageModel({
      content,
      attachment,
      room: roomId,
      sender: userId,
      readBy: [userId],
    });
    await message.save();
    await message.populate(MessageUsersPopulate);
    return message;
  }

  async findAll(
    roomId: string,
    queryMessageDto: QueryMessageDto,
  ): Promise<MessagePaginatedResponseDto> {
    const { search, page = 1, limit = 20 } = queryMessageDto;
    const matchStage: mongoose.QueryFilter<MessageDocument> = {
      room: convertStringToMongoIds(roomId),
    };
    if (search) {
      matchStage.content = {
        $regex: search,
        $options: 'i',
      };
    }
    const pipelines: PipelineStage[] = [
      {
        $match: matchStage,
      },
      {
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
                localField: 'sender',
                foreignField: '_id',
                from: 'users',
                as: 'sender',
                pipeline: [
                  {
                    $project: {
                      name: 1,
                      email: 1,
                      photo: 1,
                      role: 1,
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                localField: 'readBy',
                foreignField: '_id',
                from: 'users',
                as: 'readBy',
                pipeline: [
                  {
                    $project: {
                      name: 1,
                      email: 1,
                      photo: 1,
                      role: 1,
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: '$sender',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
        },
      },
    ];
    const [result] = await this.messageModel.aggregate(pipelines);
    const total = result.metadata?.[0]?.total || 0;
    return {
      page,
      total,
      data: result.data,
      totalPages: Math.ceil(total / limit),
    };
  }

  async readAllRoomMessages(userId: string, roomId: string): Promise<string[]> {
    const userObjectId = convertStringToMongoIds(userId);
    const roomObjectId = convertStringToMongoIds(roomId);
    const filter = {
      room: roomObjectId,
      sender: { $ne: userObjectId },
      readBy: { $ne: userObjectId },
    };
    const messages = await this.messageModel.find(filter, { _id: 1 }).lean();
    await this.messageModel.updateMany(filter, {
      $addToSet: {
        readBy: userObjectId,
      },
    });
    return messages.map((message) => String(message._id));
  }

  async countUnreadMessages(roomId: string, userId: string): Promise<number> {
    const userObjectId = convertStringToMongoIds(userId);
    const roomObjectId = convertStringToMongoIds(roomId);
    return this.messageModel.countDocuments({
      room: roomObjectId,
      sender: { $ne: userObjectId },
      readBy: { $ne: userObjectId },
    });
  }
}
