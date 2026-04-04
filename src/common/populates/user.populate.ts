import { PopulateOptions } from 'mongoose';

export const UserLikePopulate: PopulateOptions = {
  path: 'user',
  select: 'name email photo role',
};

export const UserCommentPopulate: PopulateOptions = {
  path: 'user',
  select: 'name email photo role',
};
