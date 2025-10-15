import { User } from '../../user/entity/user.entity';

/**
 * Removes sensitive fields from a user object
 * @param user The user object to sanitize
 * @returns A new user object with sensitive fields removed
 */
export const removeSensitiveFields = (
  user: User,
): Omit<User, 'password_hash'> => {
  const { password_hash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Validates user data ensuring required fields exist
 * @param user The user object to validate
 * @returns boolean indicating if the user data is valid
 */
export const validateUserData = (user: User): boolean => {
  return !!(user && user.id && user.username && user.role !== undefined);
};
