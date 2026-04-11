import {
  BadRequestException,
  Logger,
  NotFoundException,
  UseFilters,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsExceptionFilter } from 'src/common/filters/ws-exception.filter';
import {
  ChatEmitEvents,
  ChatFailedEvents,
  ChatListenEvents,
} from '../events/chat.events';
import { Model, Types } from 'mongoose';
import { Room, RoomDocument } from 'src/modules/room/room.schema';
import { InjectModel } from '@nestjs/mongoose';
import { convertStringToMongoIds } from 'src/utils/helper';
import { MessageService } from 'src/modules/message/message.service';
import { ConnectionGateway } from './connection.gateway';

export class SendMessageDto {
  roomId: string;
  content: string;
  attachment?: string;
}

export class RoomDto {
  roomId: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
@UseFilters(new WsExceptionFilter())
export class ChatGateway {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    @InjectModel(Room.name) private readonly roomModel: Model<RoomDocument>,
    private readonly messageService: MessageService,
    private readonly connectionGateway: ConnectionGateway,
  ) {}

  @SubscribeMessage(ChatListenEvents.MESSAGE_SEND)
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessageDto,
  ) {
    const userId = this.connectionGateway.getUserId(client);
    try {
      const { content, roomId, attachment } = payload;
      if (!content?.trim() && !attachment) {
        throw new BadRequestException('Message or attachment is required');
      }
      const room = await this.verifyRoom(userId, roomId);
      const message = await this.messageService.create(userId, room._id, {
        content,
        attachment,
      });
      this.server.to(roomId).emit(ChatEmitEvents.MESSAGE_RECEIVE, {
        message,
        roomId,
      });
      this.server.to(roomId).emit(ChatEmitEvents.ROOM_UPDATED, {
        room: {
          ...room,
          latestMessage: message,
        },
      });
      this.logger.log(
        `User ${userId} sending message to room ${payload.roomId}`,
      );
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to handle message: ${error.message}`);
      this.server.to(userId).emit(ChatFailedEvents.MESSAGE_SEND, {
        message: error.message,
      });
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage(ChatListenEvents.ROOM_JOIN)
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: RoomDto,
  ) {
    const userId = this.connectionGateway.getUserId(client);
    try {
      const { roomId } = payload;
      await this.verifyRoom(userId, roomId);
      client.join(roomId);
      this.logger.log(`User ${userId} joined room ${roomId}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to join room: ${error.message}`);
      this.server.to(userId).emit(ChatFailedEvents.ROOM_JOIN, {
        message: error.message,
      });
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @SubscribeMessage(ChatListenEvents.MESSAGE_MARK_ALL_READ)
  async handleReadAllMessages(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: RoomDto,
  ) {
    const userId = this.connectionGateway.getUserId(client);
    try {
      const { roomId } = payload;
      const messageIds = await this.messageService.readAllRoomMessages(
        userId,
        roomId,
      );
      this.server.to(roomId).emit(ChatEmitEvents.MESSAGE_READ, {
        messageIds,
        roomId,
        userId,
      });
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to read messages in room: ${error.message}`);
      this.server.to(userId).emit(ChatFailedEvents.MESSAGE_READ, {
        message: error.message,
      });
      return {
        success: false,
        message: error.message,
      };
    }
  }

  private async verifyRoom(userId: string, roomId: string): Promise<Room> {
    const room = await this.roomModel
      .findOne({
        _id: roomId,
        participants: convertStringToMongoIds(userId),
      })
      .lean();
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return room;
  }
}
