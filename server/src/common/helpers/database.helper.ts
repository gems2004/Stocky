import { Repository, ObjectLiteral } from 'typeorm';
import { LoggerService } from '../logger.service';
import { DynamicDatabaseService } from '../../dynamic-database/dynamic-database.service';
import { CustomException } from '../exceptions/custom.exception';
import { HttpStatus } from '@nestjs/common';

/**
 * Generic function to get a repository for a given entity
 * @param entityClass The entity class to get the repository for
 * @param logger The logger service instance
 * @param dynamicDatabaseService The dynamic database service instance
 * @returns Promise<Repository<T>> The repository for the given entity
 */
export const getRepository = async <T extends ObjectLiteral>(
  entityClass: new () => T,
  logger: LoggerService,
  dynamicDatabaseService: DynamicDatabaseService,
): Promise<Repository<T>> => {
  try {
    // Ensure the database is ready
    await ensureDatabaseReady(logger, dynamicDatabaseService);
    dynamicDatabaseService.ensureDataSourceInitialized();
    const dataSource = dynamicDatabaseService.getDataSource();
    return dataSource.getRepository(entityClass);
  } catch (error) {
    logger.error(
      `Failed to get repository for ${entityClass.name}: ${error.message}`,
    );
    throw new CustomException(
      'Database connection error',
      HttpStatus.SERVICE_UNAVAILABLE,
      `Database may not be properly configured: ${error.message}`,
    );
  }
};

/**
 * Generic function to ensure database is ready
 * @param logger The logger service instance
 * @param dynamicDatabaseService The dynamic database service instance
 * @returns Promise<void>
 */
export const ensureDatabaseReady = async (
  logger: LoggerService,
  dynamicDatabaseService: DynamicDatabaseService,
): Promise<void> => {
  try {
    dynamicDatabaseService.ensureDataSourceInitialized();
  } catch (error) {
    // If the datasource is not initialized, try to initialize it
    logger.log('Attempting to reinitialize database connection');
    await dynamicDatabaseService.initializeIfConfigured();
    dynamicDatabaseService.ensureDataSourceInitialized();
  }
};
