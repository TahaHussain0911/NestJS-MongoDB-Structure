import { ApiProperty } from '@nestjs/swagger';
import { Message } from '../message.schema';

export class MessagePaginatedResponseDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  total: number;

  @ApiProperty({
    type: [Message],
  })
  data: Message[];
}
