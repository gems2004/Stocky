import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
} from '@nestjs/common';
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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @Public()
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<SuccessResponse<AuthResponseDto>> {
    const result = await this.authService.login(loginDto);
    return ApiResponseHelper.success(result, 'Login successful');
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @Public()
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<SuccessResponse<AuthResponseDto>> {
    const result = await this.authService.refreshToken(refreshTokenDto);
    return ApiResponseHelper.success(result, 'Token refreshed successfully');
  }

  @HttpCode(HttpStatus.OK)
  @Get('profile')
  @UseGuards(AuthGuard)
  async getProfile(
    @CurrentUser() user: JwtPayload,
  ): Promise<SuccessResponse<AuthResponseDto>> {
    const result = await this.authService.getUserData(user.sub);
    return ApiResponseHelper.success(result, 'Profile retrieved successfully');
  }
}
