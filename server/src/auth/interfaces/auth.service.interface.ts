import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';

export interface IAuthService {
  login(credentials: LoginDto): Promise<AuthResponseDto>;
  refreshToken(refreshTokenData: RefreshTokenDto): Promise<AuthResponseDto>;
  getUserData(userId: number): Promise<AuthResponseDto>;
}
