import { ApiProperty } from '@nestjs/swagger';
import { Message } from '../message.schema';
import { PaginatedResponseDto } from 'src/common/dto/pagination-response.dto';

export class MessagePaginatedResponseDto extends PaginatedResponseDto {
  @ApiProperty({
    type: [Message],
  })
  data: Message[];
}
