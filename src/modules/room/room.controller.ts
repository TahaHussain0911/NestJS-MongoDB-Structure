import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { RoomService } from './room.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import {
  RoomPaginatedResponseDto,
  RoomResponseDto,
} from './dto/room-response.dto';
import { SwaggerJwtAuth } from 'src/utils/swagger.constants';
import { CreateRoomDto } from './dto/create-room.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { MessagePaginatedResponseDto } from '../message/dto/message-response.dto';
import { QueryMessageDto } from '../message/dto/query-message.dto';
import { ObjectIdParam } from 'src/common/decorators/object-id.decorator';
import { QueryRoomDto } from './dto/query-room.dto';

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
  @ApiOkResponse({
    type: MessagePaginatedResponseDto,
  })
  async findAllMessages(
    @GetUser('_id') userId: string,
    @ObjectIdParam('roomId') roomId: string,
    @Query() queryMessageDto: QueryMessageDto,
  ): Promise<MessagePaginatedResponseDto> {
    return this.roomService.findAllMessages(userId, roomId, queryMessageDto);
  }

  @Get('all')
  @ApiOperation({
    summary: 'Get all rooms of user',
  })
  @ApiOkResponse({
    type: RoomPaginatedResponseDto,
  })
  async findAllRooms(
    @GetUser('_id') userId: string,
    @Query() queryRoomDto: QueryRoomDto,
  ): Promise<RoomPaginatedResponseDto> {
    return this.roomService.findAllRooms(userId, queryRoomDto);
  }
}
