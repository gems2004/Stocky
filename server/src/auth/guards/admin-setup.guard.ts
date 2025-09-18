import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { DynamicDatabaseService } from '../../dynamic-database/dynamic-database.service';
import { User, UserRole } from '../../user/entity/user.entity';
import { DataSource, Repository } from 'typeorm';
import { Request } from 'express';

@Injectable()
export class AdminSetupGuard implements CanActivate {
  constructor(
    private readonly dynamicDatabaseService: DynamicDatabaseService,
  ) {}

  private getUserRepository(): Repository<User> {
    // Always check if DataSource is initialized
    this.dynamicDatabaseService.ensureDataSourceInitialized();

    // Always get a fresh repository from the DataSource
    const dataSource = this.dynamicDatabaseService.getDataSource();
    return dataSource.getRepository(User);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // Check if any admin user exists
      const adminCount = await this.getUserRepository().count({
        where: { role: UserRole.ADMIN },
      });

      // Allow access if no admin user exists (initial setup)
      if (adminCount === 0) {
        return true;
      }

      // If admin users exist, the AuthGuard will handle authentication
      // We just allow the flow to continue to the AuthGuard
      return true;
    } catch (error) {
      // If there's an error (e.g., database not ready), allow access
      // This is important for initial setup
      return true;
    }
  }
}
