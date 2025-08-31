import { User } from 'src/user/entity/user.entity';
import { AuthTokens } from '../types/auth-tokens.type';

export class AuthResponseDto {
  user: Omit<User, 'password_hash'>;
  tokens: AuthTokens;
}
