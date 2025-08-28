import { UserRole } from '../entity/user.entity';

export class RegisterDto {
  username: string;
  email?: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}
