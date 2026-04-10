import { Logger, UseFilters } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsExceptionFilter } from 'src/common/filters/ws-exception.filter';
import { ChatEvents } from '../events/chat.events';

export class SendMessageDto {
  roomId: string;
  content: string;
  attachment?: string;
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

  @SubscribeMessage(ChatEvents.MESSAGE_SEND)
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessageDto,
  ) {
    const userId = client.data.userId;

    this.logger.log(`User ${userId} sending message to room ${payload.roomId}`);

    try {
      return { status: 'success' };
    } catch (error) {
      this.logger.error(`Failed to handle message: ${error.message}`);
      return { status: 'error', message: error.message };
    }
  }
}
