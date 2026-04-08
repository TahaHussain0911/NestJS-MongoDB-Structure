import { Message } from 'src/modules/message/message.schema';
import { Room } from '../room.schema';
import { ApiProperty } from '@nestjs/swagger';

export class RoomResponseDto {
  @ApiProperty({
    type: Room,
  })
  room: Room & { latestMessage: Message };
}

export class RoomPaginatedResponseDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  total: number;

  @ApiProperty({
    type: [Room],
  })
  data: RoomResponseDto['room'][];
}
