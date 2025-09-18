import { Injectable, HttpStatus, Inject } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { IInventoryService } from './interfaces/inventory.service.interface';
import { InventoryLog } from './entities/inventory-log.entity';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { InventoryLogResponseDto } from './dto/inventory-log-response.dto';
import { Product } from '../product/entity/product.entity';
import { CustomException } from '../common/exceptions/custom.exception';
import { LoggerService } from '../common/logger.service';
import { DynamicDatabaseService } from '../dynamic-database/dynamic-database.service';

@Injectable()
export class InventoryService implements IInventoryService {
  constructor(
    private readonly dynamicDatabaseService: DynamicDatabaseService,
    private readonly logger: LoggerService,
  ) {
    // No initialization in constructor
  }

  private async getInventoryLogRepository(): Promise<Repository<InventoryLog>> {
    try {
      // Ensure the database is ready
      await this.ensureDatabaseReady();
      this.dynamicDatabaseService.ensureDataSourceInitialized();
      const dataSource = this.dynamicDatabaseService.getDataSource();
      return dataSource.getRepository(InventoryLog);
    } catch (error) {
      this.logger.error(`Failed to get inventory log repository: ${error.message}`);
      throw new CustomException(
        'Database connection error',
        HttpStatus.SERVICE_UNAVAILABLE,
        `Database may not be properly configured: ${error.message}`,
      );
    }
  }

  private async getProductRepository(): Promise<Repository<Product>> {
    try {
      // Ensure the database is ready
      await this.ensureDatabaseReady();
      this.dynamicDatabaseService.ensureDataSourceInitialized();
      const dataSource = this.dynamicDatabaseService.getDataSource();
      return dataSource.getRepository(Product);
    } catch (error) {
      this.logger.error(`Failed to get product repository: ${error.message}`);
      throw new CustomException(
        'Database connection error',
        HttpStatus.SERVICE_UNAVAILABLE,
        `Database may not be properly configured: ${error.message}`,
      );
    }
  }

  private async ensureDatabaseReady(): Promise<void> {
    try {
      this.dynamicDatabaseService.ensureDataSourceInitialized();
    } catch (error) {
      // If the datasource is not initialized, try to initialize it
      this.logger.log('Attempting to reinitialize database connection');
      await this.dynamicDatabaseService.initializeIfConfigured();
      this.dynamicDatabaseService.ensureDataSourceInitialized();
    }
  }

  async adjustInventory(
    adjustInventoryDto: AdjustInventoryDto,
    userId?: number,
  ): Promise<InventoryLogResponseDto> {
    try {
      const inventoryLogRepository = await this.getInventoryLogRepository();
      const productRepository = await this.getProductRepository();
      this.logger.log(
        `Attempting to adjust inventory for product ID: ${adjustInventoryDto.productId}`,
      );

      // Find the product
      const product = await productRepository.findOne({
        where: { id: adjustInventoryDto.productId },
      });

      if (!product) {
        const errorMsg = `Product not found with ID: ${adjustInventoryDto.productId}`;
        throw new CustomException(
          'Product not found',
          HttpStatus.NOT_FOUND,
          errorMsg,
        );
      }

      // Update product stock quantity
      product.stock_quantity += adjustInventoryDto.changeAmount;

      // Ensure stock quantity doesn't go below 0
      if (product.stock_quantity < 0) {
        product.stock_quantity = 0;
      }

      // Save the updated product
      await productRepository.save(product);

      // Create inventory log entry
      const inventoryLog = inventoryLogRepository.create({
        product_id: adjustInventoryDto.productId,
        change_amount: adjustInventoryDto.changeAmount,
        reason: adjustInventoryDto.reason,
        user_id: userId,
      });

      const savedLog = await inventoryLogRepository.save(inventoryLog);
      this.logger.log(
        `Successfully adjusted inventory for product ID: ${adjustInventoryDto.productId}`,
      );

      // Construct response
      const logResponse: InventoryLogResponseDto = {
        id: savedLog.id,
        product_id: savedLog.product_id,
        change_amount: savedLog.change_amount,
        reason: savedLog.reason,
        user_id: savedLog.user_id,
        created_at: savedLog.created_at,
      };

      return logResponse;
    } catch (error) {
      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred during inventory adjustment',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in adjustInventory function: ${errorMessage}`,
      );
    }
  }

  async getInventoryLogs(): Promise<InventoryLogResponseDto[]> {
    try {
      const inventoryLogRepository = await this.getInventoryLogRepository();
      this.logger.log('Fetching all inventory logs');

      // Find all inventory logs ordered by creation date
      const logs = await inventoryLogRepository.find({
        order: { created_at: 'DESC' },
      });

      this.logger.log(`Successfully fetched ${logs.length} inventory logs`);

      // Map to response DTOs
      const logResponses: InventoryLogResponseDto[] = logs.map((log) => ({
        id: log.id,
        product_id: log.product_id,
        change_amount: log.change_amount,
        reason: log.reason,
        user_id: log.user_id,
        created_at: log.created_at,
      }));

      return logResponses;
    } catch (error) {
      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred while fetching inventory logs',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in getInventoryLogs function: ${errorMessage}`,
      );
    }
  }

  async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    try {
      const productRepository = await this.getProductRepository();
      this.logger.log(
        `Fetching low stock products with threshold: ${threshold}`,
      );

      // Find products with stock quantity below threshold
      const products = await productRepository
        .createQueryBuilder('product')
        .where('product.stock_quantity < :threshold', { threshold })
        .orderBy('product.stock_quantity', 'ASC')
        .getMany();

      this.logger.log(
        `Successfully fetched ${products.length} low stock products`,
      );

      return products;
    } catch (error) {
      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred while fetching low stock products',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in getLowStockProducts function: ${errorMessage}`,
      );
    }
  }
}
