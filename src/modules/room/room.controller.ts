import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { RoomService } from './room.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoomResponseDto } from './dto/room-response.dto';
import { SwaggerJwtAuth } from 'src/utils/swagger.constants';
import { CreateRoomDto } from './dto/create-room.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@ApiTags('Rooms')
@ApiBearerAuth(SwaggerJwtAuth)
@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a chat room',
  })
  @ApiCreatedResponse({
    type: RoomResponseDto,
  })
  async create(
    @GetUser('_id') currentUserId: string,
    @Body() createMessageDto: CreateRoomDto,
  ): Promise<RoomResponseDto> {
    return this.roomService.create(currentUserId, createMessageDto);
  }

  @Get('messages/:roomId')
  @ApiOperation({
    summary: 'Get all messages of room',
  })
  @ApiCreatedResponse({
    type: RoomResponseDto,
  })
  async findAllMessages() {}
}
