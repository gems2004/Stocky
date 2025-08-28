import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { IRequestWithId } from '../interfaces/request.interface';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: IRequestWithId, res: Response, next: NextFunction) {
    const requestId = uuidv4();
    req.requestId = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
  }
}
