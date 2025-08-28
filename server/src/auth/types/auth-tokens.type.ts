import { UserRole } from '../entity/user.entity';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type JwtPayload = {
  sub: number;
  username: string;
  role: UserRole;
  exp?: number;
  iat?: number;
};
