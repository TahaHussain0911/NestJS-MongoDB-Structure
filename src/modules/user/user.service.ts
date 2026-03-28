import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User, UserDocument } from './user.schema';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found!');
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto['user']> {
    const { email } = createUserDto;
    const emailTaken = await this.userModel.findOne({
      email,
    });
    if (emailTaken) {
      throw new ConflictException('User email already exists!');
    }
    const user = await this.userModel.create(createUserDto);
    const { password, refreshId, ...restUser } = user.toObject();
    return restUser;
  }

  async updateRefreshId(userId: string, refreshId: string): Promise<void> {
    await this.userModel.updateOne(
      {
        _id: userId,
      },
      {
        refreshId,
      },
    );
  }
}
