import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, PipelineStage } from 'mongoose';
import { RoomUserPopulate } from 'src/common/populates/room.populate';
import { convertStringToMongoIds } from 'src/utils/helper';
import { MessageService } from '../message/message.service';
import { UserService } from '../user/user.service';
import { CreateRoomDto } from './dto/create-room.dto';
import {
  RoomPaginatedResponseDto,
  RoomResponseDto,
} from './dto/room-response.dto';
import { Room, RoomDocument } from './room.schema';
import { MessagePaginatedResponseDto } from '../message/dto/message-response.dto';
import { QueryMessageDto } from '../message/dto/query-message.dto';
import { QueryRoomDto } from './dto/query-room.dto';
import { ChatGateway } from '../socket/gateways/chat.gateway';
import { ChatEmitEvents } from '../socket/events/chat.events';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(Room.name) private readonly roomModel: Model<RoomDocument>,
    private readonly userService: UserService,
    private readonly messageService: MessageService,
    private readonly chatGateway: ChatGateway,
  ) {}

  async create(
    currentUserId: string,
    createMessageDto: CreateRoomDto,
  ): Promise<RoomResponseDto> {
    const { userId: targetUserId, ...rest } = createMessageDto;
    if (targetUserId === currentUserId) {
      throw new BadRequestException('Cannot create a room with yourself!');
    }
    const targetUser = await this.userService.findById(targetUserId);
    if (!targetUser) {
      throw new BadRequestException('Target user not found');
    }
    let isNewRoom = false;
    let room = await this.roomModel
      .findOneAndUpdate(
        {
          participants: {
            $all: [currentUserId, convertStringToMongoIds(targetUserId)],
          },
        },
        {
          updatedAt: new Date(),
        },
      )
      .populate(RoomUserPopulate);
    if (!room) {
      room = new this.roomModel({
        participants: [currentUserId, targetUser._id],
      });
      await room.save();
      await room.populate(RoomUserPopulate);
      isNewRoom = true;
    }
    const message = await this.messageService.create(
      currentUserId,
      room._id,
      rest,
    );
    const finalizedRoom = {
      ...room.toObject(),
      latestMessage: message,
      unreadCount: await this.messageService.countUnreadMessages(String(room._id), currentUserId),
    };

    for (const participant of room.participants) {
      const participantIdStr = String(participant._id);

      if (isNewRoom) {
        this.chatGateway.server
          .in(participantIdStr)
          .socketsJoin(String(room._id));
      }

      const participantUnreadCount = await this.messageService.countUnreadMessages(String(room._id), participantIdStr);
      
      const payloadRoom = {
        ...room.toObject(),
        latestMessage: message,
        unreadCount: participantUnreadCount,
      };

      if (!isNewRoom || participantIdStr !== String(currentUserId)) {
        this.chatGateway.server
          .to(participantIdStr)
          .emit(ChatEmitEvents.ROOM_UPDATED, {
            room: payloadRoom,
          });
      }
    }

    return {
      room: finalizedRoom,
    };
  }

  async findAllRooms(
    userId: string,
    queryRoomDto: QueryRoomDto,
  ): Promise<RoomPaginatedResponseDto> {
    const { search, page = 1, limit = 20 } = queryRoomDto;
    const matchStage: mongoose.QueryFilter<RoomDocument> = {
      participants: userId,
    };

    const pipelines: PipelineStage[] = [
      {
        $match: matchStage,
      },
      {
        $lookup: {
          localField: 'participants',
          foreignField: '_id',
          from: 'users',
          as: 'participants',
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
    ];

    if (search) {
      pipelines.push({
        $match: {
          participants: {
            $elemMatch: {
              _id: { $ne: userId },
              name: {
                $regex: search,
                $options: 'i',
              },
            },
          },
        },
      });
    }
    pipelines.push(
      {
        $lookup: {
          from: 'messages',
          as: 'latestMessage',
          let: { roomId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$room', '$$roomId'] },
              },
            },
            {
              $sort: {
                createdAt: -1,
              },
            },
            { $limit: 1 },
            {
              $lookup: {
                foreignField: '_id',
                localField: 'sender',
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
              $unwind: {
                path: '$sender',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                foreignField: '_id',
                localField: 'readBy',
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
          ],
        },
      },
      {
        $addFields: {
          latestMessage: { $arrayElemAt: ['$latestMessage', 0] },
        },
      },
      {
        $lookup: {
          from: 'messages',
          as: 'unreadCount',
          let: { roomId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$room', '$$roomId'] },
                readBy: { $ne: convertStringToMongoIds(userId) },
              },
            },
            {
              $count: 'count',
            },
          ],
        },
      },
      {
        $addFields: {
          unreadCount: {
            $ifNull: [{ $arrayElemAt: ['$unreadCount.count', 0] }, 0],
          },
        },
      },
    );
    pipelines.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [
          { $sort: { updatedAt: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
        ],
      },
    });

    const [result] = await this.roomModel.aggregate(pipelines);
    const total = result.metadata?.[0]?.total || 0;

    return {
      page,
      total,
      data: result.data,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAllMessages(
    userId: string,
    roomId: string,
    queryMessageDto: QueryMessageDto,
  ): Promise<MessagePaginatedResponseDto> {
    const room = await this.roomModel.findOne({
      _id: roomId,
      participants: userId,
    });
    if (!room) {
      throw new BadRequestException('Room not found');
    }
    const result = await this.messageService.findAll(roomId, queryMessageDto);
    return result;
  }
}
