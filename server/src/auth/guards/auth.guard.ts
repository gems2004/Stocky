import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from '../types/auth-tokens.type';
import { AuthenticatedRequest } from '../types/request.type';
import { CustomException } from '../../common/exceptions/custom.exception';
import { LoggerService } from '../../common/logger.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly logger: LoggerService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new CustomException(
        'Access token is missing',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      // JwtService should already have the secret configured through JwtModule
      const payload = this.jwtService.verify<JwtPayload>(token);
      request.user = payload;
    } catch (error) {
      this.logger.error(`Token verification failed: ${error.message}`);
      throw new CustomException(
        'Invalid or expired token',
        HttpStatus.UNAUTHORIZED,
        `Token verification failed: ${error.message}`,
      );
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
