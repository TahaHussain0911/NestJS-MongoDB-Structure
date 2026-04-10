import { forwardRef, Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Room, RoomSchema } from './room.schema';
import { UserModule } from '../user/user.module';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Room.name,
        schema: RoomSchema,
      },
    ]),
    forwardRef(() => MessageModule),
    UserModule,
  ],
  controllers: [RoomController],
  providers: [RoomService],
  exports: [MongooseModule],
})
export class RoomModule {}
