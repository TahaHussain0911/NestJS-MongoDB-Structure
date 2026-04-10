import {
  Injectable,
  Logger,
  UnauthorizedException,
  UseFilters,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Model } from 'mongoose';
import { Server, Socket } from 'socket.io';
import { TypedConfigService } from 'src/config/typed-config.service';
import { TokenPayload } from 'src/modules/auth/types/token-payload';
import { Room, RoomDocument } from 'src/modules/room/room.schema';
import { UserService } from 'src/modules/user/user.service';
import { convertStringToMongoIds } from 'src/utils/helper';
import { ConnectionEvents } from '../events/connection.events';
import { WsExceptionFilter } from 'src/common/filters/ws-exception.filter';
import { SocketSessionService } from '../services/socket-session.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
@UseFilters(new WsExceptionFilter())
export class ConnectionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private readonly logger = new Logger(ConnectionGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: TypedConfigService,
    private readonly userService: UserService,
    private readonly sessionService: SocketSessionService,
    @InjectModel(Room.name)
    private readonly roomModel: Model<RoomDocument>,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        throw new Error('Token not provided');
      }
      const tokenPayload = await this.verifyToken(token);
      if (!tokenPayload.sub) {
        throw new Error(`UserId not found in token payload: ${tokenPayload}`);
      }
      const user = await this.userService.findById(tokenPayload.sub);
      if (!user) {
        throw new Error('User not found!');
      }
      const userId = String(user._id); // as user._id is mongo objectId
      client.data.userId = userId;
      client.join(userId);
      await this.joinUserRooms(client, userId);

      this.sessionService.addSocket(userId, client.id);

      client.emit(ConnectionEvents.CONNECTION_SUCCESS, {
        userId,
        socketId: client.id,
      });
      this.logger.log(`User ${userId} connected with socket id ${client.id}`);
    } catch (error) {
      this.logger.error(`Error connecting to socket: ${error.message}`);
      client.emit(ConnectionEvents.CONNECTION_FAILED, {
        message: `Failed connecting to socket: ${error.message}`,
      });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.getUserId(client);
    this.sessionService.removeSocket(userId, client.id);
  }

  private async joinUserRooms(client: Socket, userId: string): Promise<void> {
    const rooms = await this.roomModel.find({
      participants: convertStringToMongoIds(userId), // participants will be matched on mongo id only
    });
    rooms.forEach((room) => {
      client.join(String(room._id));
    });
    this.logger.log(`User connected to rooms ${rooms.length}`);
  }

  private getUserId(client: Socket): string {
    const userId = client.data.userId;
    if (!userId) {
      throw new UnauthorizedException();
    }
    return userId;
  }

  private extractToken(client: Socket): string {
    let token = client.handshake.auth.token;
    if (!token && client.handshake.headers['authorization']) {
      token = client.handshake.headers['authorization']
        .replace('Bearer ', '')
        .trim();
    }
    return token;
  }

  private async verifyToken(token: string): Promise<TokenPayload> {
    try {
      const payload = await this.jwtService.verify(token, {
        secret: this.config.get('JWT_SECRET'),
      });
      return payload;
    } catch (error) {
      this.logger.error(`Verifying token failed: ${error.message}`);
      throw error;
    }
  }
}
