import { DataSource } from 'typeorm';
import { User, UserRole } from '../../user/entity/user.entity';
import * as bcrypt from 'bcryptjs';

export const seedUsers = async (dataSource: DataSource) => {
  const userRepository = dataSource.getRepository(User);

  // Check if users already exist to avoid duplicates
  const existingUsers = await userRepository.find();
  if (existingUsers.length > 0) {
    console.log('Users already exist, skipping seeding');
    return;
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = [
    {
      username: 'admin',
      email: 'admin@example.com',
      password_hash: hashedPassword,
      first_name: 'Admin',
      last_name: 'User',
      role: UserRole.ADMIN,
      is_active: true,
    },
    {
      username: 'cashier',
      email: 'cashier@example.com',
      password_hash: hashedPassword,
      first_name: 'Cashier',
      last_name: 'User',
      role: UserRole.CASHIER,
      is_active: true,
    },
  ];

  for (const userData of users) {
    const newUser = userRepository.create(userData);
    await userRepository.save(newUser);
    console.log(`Created user: ${userData.username}`);
  }
};
