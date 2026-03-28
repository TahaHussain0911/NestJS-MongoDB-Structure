import { User } from '../user.schema';

export class UserResponseDto {
  user: Omit<User, 'password' | 'refreshId'>;
}
