import { PopulateOptions } from 'mongoose';

export const MessageUsersPopulate: PopulateOptions[] = [
  {
    path: 'sender',
    select: 'name email photo role',
  },
  {
    path: 'readBy',
    select: 'name email photo role',
  },
];
