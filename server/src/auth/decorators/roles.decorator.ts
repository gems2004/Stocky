import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/user/entity/user.entity';

export const Role = (...roles: UserRole[]) => SetMetadata('roles', roles);
