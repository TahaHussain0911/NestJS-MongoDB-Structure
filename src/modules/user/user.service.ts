import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import {
  UserPaginatedResponseDto,
  UserResponseDto,
} from './dto/user-response.dto';
import { User, UserDocument } from './user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findAll(queryUserDto: QueryUserDto): Promise<UserPaginatedResponseDto> {
    const { search, page = 1, limit = 20 } = queryUserDto;
    const pipelines: PipelineStage[] = [];
    if (search) {
      pipelines.push({
        $match: {
          $or: [
            {
              name: {
                $regex: search,
                $options: 'i',
              },
            },
            {
              email: {
                $regex: search,
                $options: 'i',
              },
            },
          ],
        },
      });
    }
    pipelines.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $skip: (page - 1) * limit,
          },
          {
            $limit: limit,
          },
        ],
      },
    });
    const result = await this.userModel.aggregate(pipelines);
    const total = result?.[0]?.metadata?.[0]?.total || 0;
    return {
      page,
      total,
      totalPages: Math.ceil(total / limit),
      data: result?.[0]?.data,
    };
  }

  async findById(id: string, select?: string): Promise<User> {
    const query = this.userModel.findById(id);
    if (select) {
      query.select(select);
    }
    const user = await query.lean();

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string, select?: string) {
    const query = this.userModel.findOne({ email });
    if (select) {
      query.select(select);
    }

    const user = await query.lean();
    if (!user) {
      throw new BadRequestException('Invalid credentials!');
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

  async update(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const { name, photo } = updateUserDto;
    const user = await this.userModel
      .findByIdAndUpdate(
        { _id: userId },
        {
          name,
          photo,
        },
        {
          returnDocument: 'after',
        },
      )
      .lean();
    const { password, refreshId, ...restUser } = user?.toObject();
    return {
      user: restUser,
    };
  }

  async updateRefreshId(
    userId: string,
    refreshId: string | null,
  ): Promise<void> {
    await this.userModel.updateOne(
      {
        _id: userId,
      },
      {
        refreshId,
      },
    );
  }

  async saveOtp(userId: string, otp: string, otpExpires: Date): Promise<void> {
    await this.userModel.updateOne(
      { _id: userId },
      { otp, otpExpires, otpVerified: false },
    );
  }

  async setOtpVerified(userId: string): Promise<void> {
    await this.userModel.updateOne(
      { _id: userId },
      { otpVerified: true },
    );
  }

  async updatePasswordAuth(userId: string, hashedPassword: string): Promise<void> {
    await this.userModel.updateOne(
      { _id: userId },
      {
        password: hashedPassword,
        passwordChangedAt: new Date(),
        $unset: { otp: 1, otpExpires: 1 },
        otpVerified: false,
      },
    );
  }
}
