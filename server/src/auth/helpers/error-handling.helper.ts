import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../types/auth-tokens.type';
import { CustomException } from '../../common/exceptions/custom.exception';
import { HttpStatus } from '@nestjs/common';

/**
 * Verifies a JWT token and returns the payload
 * @param jwtService The JWT service to use for verification
 * @param token The token to verify
 * @returns The verified payload
 */
export const verifyToken = (
  jwtService: JwtService,
  token: string,
): JwtPayload => {
  // Verify the token and assert its type
  const verifiedPayload = jwtService.verify<JwtPayload>(token);

  // Type guard to ensure payload has the required properties
  if (
    !verifiedPayload ||
    typeof verifiedPayload !== 'object' ||
    !('sub' in verifiedPayload) ||
    !('username' in verifiedPayload)
  ) {
    throw new Error('Invalid token payload');
  }

  // Ensure sub is a number
  if (typeof verifiedPayload.sub !== 'number') {
    throw new Error('Invalid user ID in token payload');
  }

  return verifiedPayload;
};
