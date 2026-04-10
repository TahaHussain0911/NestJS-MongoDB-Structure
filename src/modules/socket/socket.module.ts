import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatGateway } from './gateways/chat.gateway';
import { ConnectionGateway } from './gateways/connection.gateway';
import { SocketSessionService } from './services/socket-session.service';
import { UserModule } from '../user/user.module';
import { RoomModule } from '../room/room.module';

@Module({
  imports: [JwtModule.register({}), UserModule, RoomModule],
  providers: [SocketSessionService, ConnectionGateway, ChatGateway],
  exports: [SocketSessionService, ConnectionGateway, ChatGateway],
})
export class SocketModule {}
