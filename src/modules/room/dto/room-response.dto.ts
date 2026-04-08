import { Message } from 'src/modules/message/message.schema';
import { Room } from '../room.schema';
import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from 'src/common/dto/pagination-response.dto';

export class RoomResponseDto {
  @ApiProperty({
    type: Room,
  })
  room: Room & { latestMessage: Message };
}

export class RoomPaginatedResponseDto extends PaginatedResponseDto {
  @ApiProperty({
    type: [RoomResponseDto['room']],
  })
  data: RoomResponseDto['room'][];
}
