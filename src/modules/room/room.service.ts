import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Room, RoomDocument } from './room.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(Room.name) private readonly roomModel: Model<RoomDocument>,
  ) {}
}
