import { UserRole } from '../../user/entity/user.entity';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export type JwtPayload = {
  sub: number;
  username: string;
  role: UserRole;
  exp?: number;
  iat?: number;
};
