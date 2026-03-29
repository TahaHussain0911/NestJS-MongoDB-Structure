import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { SwaggerJwtAuth } from 'src/utils/swagger.constants';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from './user.schema';
import {
  UserPaginatedResponseDto,
  UserResponseDto,
} from './dto/user-response.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@ApiBearerAuth(SwaggerJwtAuth)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('admin/all')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Get all users [Admin role]',
  })
  @ApiOkResponse({
    type: UserPaginatedResponseDto,
  })
  async findAll(
    @Query() queryUserDto: QueryUserDto,
  ): Promise<UserPaginatedResponseDto> {
    return this.userService.findAll(queryUserDto);
  }

  @Get('admin/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Get single user details [Admin role]',
  })
  @ApiOkResponse({
    type: UserResponseDto,
  })
  async findOneAdmin(@Param('id') userId: string): Promise<UserResponseDto> {
    return { user: await this.userService.findById(userId) };
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get current user details',
  })
  @ApiOkResponse({
    type: UserResponseDto,
  })
  async findOne(@GetUser('_id') userId: string): Promise<UserResponseDto> {
    return { user: await this.userService.findById(userId) };
  }

  @Patch('update-me')
  @ApiOperation({
    summary: 'Update current user details',
  })
  @ApiOkResponse({
    type: UserResponseDto,
  })
  async update(
    @GetUser('_id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(userId, updateUserDto);
  }
}
