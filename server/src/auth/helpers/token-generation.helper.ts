import { JwtService } from '@nestjs/jwt';

/**
 * Generates an access token using the provided payload
 * @param jwtService The JWT service instance to use for signing
 * @param payload The payload to include in the token
 * @returns Promise<string> The generated access token
 */
export const generateAccessToken = async (jwtService: JwtService, payload: object): Promise<string> => {
  try {
    return jwtService.sign(payload);
  } catch (signError) {
    throw new Error(`Failed to generate access token: ${signError.message}`);
  }
};

/**
 * Generates a refresh token using the provided payload
 * @param jwtService The JWT service instance to use for signing
 * @param payload The payload to include in the token
 * @returns Promise<string> The generated refresh token
 */
export const generateRefreshToken = async (jwtService: JwtService, payload: object): Promise<string> => {
  try {
    return jwtService.sign(payload, {
      expiresIn: '1d',
    });
  } catch (signError) {
    throw new Error(`Failed to generate refresh token: ${signError.message}`);
  }
};