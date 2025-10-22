import { LoggerService } from './logger.service';
import { DynamicDatabaseService } from '../dynamic-database/dynamic-database.service';
import { Repository, ObjectLiteral } from 'typeorm';
import { getRepository, ensureDatabaseReady } from './helpers';

export abstract class TypeOrmService {
  constructor(
    protected readonly dynamicDatabaseService: DynamicDatabaseService,
    protected readonly logger: LoggerService,
  ) {}

  /**
   * Generic function to get a repository for a given entity
   * @param entityClass The entity class to get the repository for
   * @returns Promise<Repository<T>> The repository for the given entity
   */
  protected async getRepository<T extends ObjectLiteral>(
    entityClass: new () => T,
  ): Promise<Repository<T>> {
    return await getRepository(
      entityClass,
      this.logger,
      this.dynamicDatabaseService,
    );
  }

  /**
   * Generic function to ensure database is ready
   * @returns Promise<void>
   */
  protected async ensureDatabaseReady(): Promise<void> {
    return await ensureDatabaseReady(this.logger, this.dynamicDatabaseService);
  }
}
