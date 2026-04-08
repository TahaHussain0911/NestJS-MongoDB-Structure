import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';
import { CreateMessageDto } from 'src/modules/message/dto/create-message.dto';

export class CreateRoomDto extends CreateMessageDto {
  @ApiProperty()
  @IsMongoId()
  userId: string;
}
