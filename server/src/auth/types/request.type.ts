import { Request } from 'express';
import { JwtPayload } from './auth-tokens.type';

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
