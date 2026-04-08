import { PopulateOptions } from 'mongoose';

export const RoomUserPopulate: PopulateOptions = {
  path: 'participants',
  select: 'name email photo role',
};
