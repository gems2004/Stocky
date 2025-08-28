import { Request } from 'express';

export interface IRequestWithId extends Request {
  requestId: string;
}
