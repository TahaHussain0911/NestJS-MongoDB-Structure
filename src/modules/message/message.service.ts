import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MessageUsersPopulate } from 'src/common/populates/message.populate';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message, MessageDocument } from './message.schema';
import { MessagePaginatedResponseDto } from './dto/message-response.dto';

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
}
