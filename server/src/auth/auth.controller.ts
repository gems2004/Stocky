import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { CustomException } from '../common/exceptions/custom.exception';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtPayload } from './types/auth-tokens.type';
import { ApiResponseHelper } from '../common/helpers/api-response.helper';
import { SuccessResponse } from '../common/types/api-response.type';
import { AppReadyGuard } from '../dynamic-database/guards/app-ready.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @Public()
  async login(@Body() loginDto: LoginDto, @Res() res: Response): Promise<void> {
    const authResult = await this.authService.login(loginDto);

    // Set access token in HTTP-only cookie
    res.cookie('accessToken', authResult.tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Set to true in production
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
    });

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', authResult.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Set to true in production
      sameSite: 'lax',
      maxAge: 24 * 60 * 1000, // 24 hours in milliseconds
    });

    // Send response without tokens in body
    const responseWithoutTokens = {
      ...authResult,
      tokens: {
        accessToken: '', // Don't send tokens in response body
        refreshToken: '',
      },
    };

    res.json(
      ApiResponseHelper.success(responseWithoutTokens, 'Login successful'),
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @Public()
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Res() res: Response,
  ): Promise<void> {
    // If refresh token is not provided in the request body, try to get it from cookies
    let refreshToken = refreshTokenDto.refreshToken;
    if (!refreshToken) {
      // Get the refresh token from cookies
      refreshToken = res.req.cookies?.refreshToken;
    }

    if (!refreshToken) {
      throw new CustomException(
        'Refresh token is missing',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Create a temporary DTO with the refresh token
    const tempRefreshTokenDto = { refreshToken };
    const authResult = await this.authService.refreshToken(tempRefreshTokenDto);

    // Set new access token in HTTP-only cookie
    res.cookie('accessToken', authResult.tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Set to true in production
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
    });

    // Set new refresh token in HTTP-only cookie
    res.cookie('refreshToken', authResult.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Set to true in production
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    });

    // Send response without tokens in body
    const responseWithoutTokens = {
      ...authResult,
      tokens: {
        accessToken: '', // Don't send tokens in response body
        refreshToken: '',
      },
    };

    res.json(
      ApiResponseHelper.success(
        responseWithoutTokens,
        'Token refreshed successfully',
      ),
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get('profile')
  @UseGuards(AuthGuard, AppReadyGuard)
  async getProfile(
    @CurrentUser() user: JwtPayload,
  ): Promise<SuccessResponse<AuthResponseDto>> {
    const result = await this.authService.getUserData(user.sub);
    return ApiResponseHelper.success(result, 'Profile retrieved successfully');
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  @UseGuards(AuthGuard, AppReadyGuard)
  async logout(@Res() res: Response): Promise<void> {
    // Clear authentication cookies
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.json(ApiResponseHelper.success(null, 'Logout successful'));
  }
}
