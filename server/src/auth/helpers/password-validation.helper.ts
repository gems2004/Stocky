import * as bcrypt from 'bcryptjs';

/**
 * Validates a password against a stored hash
 * @param password The plain text password to validate
 * @param hashedPassword The stored hash to compare against
 * @returns Promise<boolean> True if the password is valid, false otherwise
 */
export const validatePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    // Log the error if needed, but don't expose bcrypt errors to the caller
    console.error('Password validation error:', error);
    return false;
  }
};