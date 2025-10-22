import { Injectable, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IInventoryService } from './interfaces/inventory.service.interface';
import { InventoryLog } from './entities/inventory-log.entity';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { InventoryLogResponseDto } from './dto/inventory-log-response.dto';
import { Product } from '../product/entity/product.entity';
import { CustomException } from '../common/exceptions/custom.exception';
import { LoggerService } from '../common/logger.service';
import { DynamicDatabaseService } from '../dynamic-database/dynamic-database.service';
import { TypeOrmService } from '../common/typeorm.service';

@Injectable()
export class InventoryService extends TypeOrmService implements IInventoryService {
  constructor(
    protected readonly dynamicDatabaseService: DynamicDatabaseService,
    protected readonly logger: LoggerService,
  ) {
    super(dynamicDatabaseService, logger);
  }

  async adjustInventory(
    adjustInventoryDto: AdjustInventoryDto,
    userId?: number,
  ): Promise<InventoryLogResponseDto> {
    try {
      const inventoryLogRepository = await this.getRepository(InventoryLog);
      const productRepository = await this.getRepository(Product);
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
        product_name: product.name, // Include the product name in the response
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

  async getInventoryLogsWithPagination(
    page: number,
    limit: number,
  ): Promise<{
    data: InventoryLogResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const inventoryLogRepository = await this.getRepository(InventoryLog);
      this.logger.log(
        `Fetching inventory logs with pagination - Page: ${page}, Limit: ${limit}`,
      );

      // Calculate offset
      const offset = (page - 1) * limit;

      // Get total count
      const total = await inventoryLogRepository.count();

      // Find paginated inventory logs with product information ordered by creation date
      const logs = await inventoryLogRepository.find({
        relations: ['product'],
        order: { created_at: 'DESC' },
        skip: offset,
        take: limit,
        withDeleted: true,
      });

      this.logger.log(
        `Successfully fetched ${logs.length} inventory logs out of ${total} total`,
      );

      // Map to response DTOs
      const logResponses: InventoryLogResponseDto[] = logs.map((log) => ({
        id: log.id,
        product_id: log.product_id,
        product_name: log.product?.name,
        change_amount: log.change_amount,
        reason: log.reason,
        user_id: log.user_id,
        created_at: log.created_at,
      }));

      return {
        data: logResponses,
        total,
        page,
        limit,
      };
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
        `Unexpected error in getInventoryLogsWithPagination function: ${errorMessage}`,
      );
    }
  }
}
