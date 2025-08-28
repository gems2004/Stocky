import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../entity/user.entity';

export const Role = (...roles: UserRole[]) => SetMetadata('roles', roles);
