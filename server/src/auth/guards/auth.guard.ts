import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
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

    const ctx = context.switchToHttp();
    const request = ctx.getRequest<AuthenticatedRequest>();
    const response = ctx.getResponse<Response>();
    const token = this.extractTokenFromCookies(request);

    if (!token) {
      // If access token is missing, try to refresh using the refresh token
      return this.handleTokenRefresh(request, response);
    }

    try {
      // JwtService should already have the secret configured through JwtModule
      const payload = this.jwtService.verify<JwtPayload>(token);
      request.user = payload;
      return true;
    } catch (error) {
      this.logger.error(`Access token verification failed: ${error.message}`);
      // If access token is invalid/expired, try to refresh
      return this.handleTokenRefresh(request, response);
    }
  }

  private handleTokenRefresh(
    request: AuthenticatedRequest,
    response: Response,
  ): boolean {
    const refreshToken = this.extractRefreshTokenFromCookies(request);

    if (!refreshToken) {
      throw new CustomException(
        'Access token is missing and no refresh token available',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      // Verify the refresh token
      const payload = this.jwtService.verify<JwtPayload>(refreshToken);

      // Generate new access token
      const newAccessToken = this.jwtService.sign(
        { sub: payload.sub, username: payload.username, role: payload.role },
        { expiresIn: '15m' }, // 15 minutes like in login
      );

      // Set the new access token in cookies
      response.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
      });

      // Update the request user with the payload from the refresh token
      request.user = payload;
      return true;
    } catch (error) {
      this.logger.error(`Refresh token verification failed: ${error.message}`);
      throw new CustomException(
        'Invalid or expired refresh token',
        HttpStatus.UNAUTHORIZED,
        `Refresh token verification failed: ${error.message}`,
      );
    }
  }

  private extractTokenFromCookies(request: Request): string | undefined {
    // Try to get the access token from cookies
    return (request as any).cookies?.accessToken;
  }

  private extractRefreshTokenFromCookies(request: Request): string | undefined {
    // Try to get the refresh token from cookies
    return (request as any).cookies?.refreshToken;
  }
}
