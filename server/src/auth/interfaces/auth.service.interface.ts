import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';

export interface IAuthService {
  register(userData: RegisterDto): Promise<AuthResponseDto>;
  login(credentials: LoginDto): Promise<AuthResponseDto>;
  refreshToken(refreshTokenData: RefreshTokenDto): Promise<AuthResponseDto>;
  getUserData(userId: number): Promise<AuthResponseDto>;
}
