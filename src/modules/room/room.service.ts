import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoomUserPopulate } from 'src/common/populates/room.populate';
import { convertStringToMongoIds } from 'src/utils/helper';
import { MessageService } from '../message/message.service';
import { UserService } from '../user/user.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomResponseDto } from './dto/room-response.dto';
import { Room, RoomDocument } from './room.schema';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(Room.name) private readonly roomModel: Model<RoomDocument>,
    private readonly userService: UserService,
    private readonly messageService: MessageService,
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
    return {
      room: {
        ...room.toObject(),
        latestMessage: message,
      },
    };
  }
}
