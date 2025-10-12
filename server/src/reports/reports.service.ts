import { Injectable, HttpStatus, Inject } from '@nestjs/common';
import { Repository, Between, DataSource } from 'typeorm';
import { Transaction } from '../transaction/entity/transaction.entity';
import { TransactionItem } from '../transaction/entity/transaction-item.entity';
import { Product } from '../product/entity/product.entity';
import { SalesSummaryDto } from './dto/sales-summary.dto';
import { TopProductDto, TopProductsResponseDto } from './dto/top-products.dto';
import {
  ProfitMarginDto,
  ProfitMarginResponseDto,
} from './dto/profit-margin.dto';
import { CustomException } from '../common/exceptions/custom.exception';
import { LoggerService } from '../common/logger.service';
import {
  TopProductsRawResult,
  ProfitMarginRawResult,
} from './interfaces/transaction-items.interface';
import { DynamicDatabaseService } from '../dynamic-database/dynamic-database.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly dynamicDatabaseService: DynamicDatabaseService,
    private readonly logger: LoggerService,
  ) {
    // No initialization in constructor
  }

  private async getTransactionRepository(): Promise<Repository<Transaction>> {
    try {
      // Ensure the database is ready
      await this.ensureDatabaseReady();
      this.dynamicDatabaseService.ensureDataSourceInitialized();
      const dataSource = this.dynamicDatabaseService.getDataSource();
      return dataSource.getRepository(Transaction);
    } catch (error) {
      this.logger.error(
        `Failed to get transaction repository: ${error.message}`,
      );
      throw new CustomException(
        'Database connection error',
        HttpStatus.SERVICE_UNAVAILABLE,
        `Database may not be properly configured: ${error.message}`,
      );
    }
  }

  private async getTransactionItemRepository(): Promise<
    Repository<TransactionItem>
  > {
    try {
      // Ensure the database is ready
      await this.ensureDatabaseReady();
      this.dynamicDatabaseService.ensureDataSourceInitialized();
      const dataSource = this.dynamicDatabaseService.getDataSource();
      return dataSource.getRepository(TransactionItem);
    } catch (error) {
      this.logger.error(
        `Failed to get transaction item repository: ${error.message}`,
      );
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

  async getSalesSummary(
    startDate?: Date,
    endDate?: Date,
  ): Promise<SalesSummaryDto> {
    try {
      const transactionRepository = await this.getTransactionRepository();
      this.logger.log('Generating sales summary report');

      // Set default date range if not provided (last 30 days)
      const now = new Date();
      const defaultStartDate = new Date(
        now.getTime() - 30 * 24 * 60 * 60 * 1000,
      );
      const start = startDate || defaultStartDate;
      const end = endDate || now;

      // Get transactions in date range
      const transactions = await transactionRepository.find({
        where: {
          created_at: Between(start, end),
          status: 'completed',
        },
      });

      // Calculate summary metrics
      const total_sales = transactions.reduce(
        (sum, transaction) => sum + Number(transaction.total_amount),
        0,
      );

      const total_transactions = transactions.length;

      const average_transaction_value =
        total_transactions > 0 ? total_sales / total_transactions : 0;

      this.logger.log(
        `Sales summary generated: ${total_transactions} transactions, total sales: ${total_sales}`,
      );

      return {
        total_sales,
        total_transactions,
        average_transaction_value,
        date_range: {
          start,
          end,
        },
      };
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred while generating sales summary',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in getSalesSummary function: ${errorMessage}`,
      );
    }
  }

  async getTopProducts(
    limit: number = 10,
    startDate?: Date,
    endDate?: Date,
  ): Promise<TopProductsResponseDto> {
    try {
      const transactionItemRepository =
        await this.getTransactionItemRepository();
      this.logger.log('Generating top products report');

      // Set default date range if not provided (last 30 days)
      const now = new Date();
      const defaultStartDate = new Date(
        now.getTime() - 30 * 24 * 60 * 60 * 1000,
      );
      const start = startDate || defaultStartDate;
      const end = endDate || now;

      // Get transaction items with product info in date range
      const transactionItems = await transactionItemRepository
        .createQueryBuilder('item')
        .innerJoin('item.transaction', 'transaction')
        .innerJoin('item.product', 'product')
        .select([
          'item.product_id',
          'product.name',
          'SUM(item.quantity) as quantity_sold',
          'SUM(item.total_price) as total_revenue',
        ])
        .where('transaction.created_at BETWEEN :start AND :end', { start, end })
        .andWhere('transaction.status = :status', { status: 'completed' })
        .groupBy('item.product_id, product.name')
        .orderBy('quantity_sold', 'DESC')
        .limit(limit)
        .getRawMany();

      // Map to DTOs with rank
      const products: TopProductDto[] = transactionItems.map(
        (item: TopProductsRawResult, index) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity_sold: parseInt(item.quantity_sold, 10),
          total_revenue: parseFloat(item.total_revenue),
          rank: index + 1,
        }),
      );

      this.logger.log(
        `Top products report generated with ${products.length} products`,
      );

      return {
        products,
        date_range: {
          start,
          end,
        },
      };
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred while generating top products report',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in getTopProducts function: ${errorMessage}`,
      );
    }
  }

  async getProfitMargin(
    startDate?: Date,
    endDate?: Date,
  ): Promise<ProfitMarginResponseDto> {
    try {
      const transactionItemRepository =
        await this.getTransactionItemRepository();
      const productRepository = await this.getProductRepository();
      this.logger.log('Generating profit margin report');

      // Set default date range if not provided (last 30 days)
      const now = new Date();
      const defaultStartDate = new Date(
        now.getTime() - 30 * 24 * 60 * 60 * 1000,
      );
      const start = startDate || defaultStartDate;
      const end = endDate || now;

      // Get transaction items with product info in date range
      const transactionItems = await transactionItemRepository
        .createQueryBuilder('item')
        .innerJoin('item.transaction', 'transaction')
        .innerJoin('item.product', 'product')
        .select([
          'item.product_id',
          'product.name',
          'product.cost',
          'product.price',
          'SUM(item.quantity) as quantity_sold',
          'SUM(item.total_price) as total_revenue',
        ])
        .where('transaction.created_at BETWEEN :start AND :end', { start, end })
        .andWhere('transaction.status = :status', { status: 'completed' })
        .groupBy('item.product_id, product.name, product.cost, product.price')
        .getRawMany();

      // Calculate profit metrics for each product
      const products: ProfitMarginDto[] = transactionItems.map(
        (item: ProfitMarginRawResult) => {
          const cost = parseFloat(item.product_cost) || 0;
          const price = parseFloat(item.product_price) || 0;
          const quantity_sold = parseInt(item.quantity_sold, 10) || 0;
          const total_revenue = parseFloat(item.total_revenue) || 0;
          const profit = price - cost;
          const profit_margin_percentage =
            price > 0 ? (profit / price) * 100 : 0;
          const total_profit = profit * quantity_sold;

          return {
            product_id: item.product_id,
            product_name: item.product_name,
            cost,
            price,
            profit,
            profit_margin_percentage,
            quantity_sold,
            total_profit,
          };
        },
      );

      // Sort by total profit descending
      products.sort((a, b) => b.total_profit - a.total_profit);

      // Calculate overall profit margin
      const total_revenue = products.reduce(
        (sum, product) => sum + product.price * product.quantity_sold,
        0,
      );

      const total_cost = products.reduce(
        (sum, product) => sum + product.cost * product.quantity_sold,
        0,
      );

      const overall_profit_margin_percentage =
        total_revenue > 0
          ? ((total_revenue - total_cost) / total_revenue) * 100
          : 0;

      this.logger.log(
        `Profit margin report generated for ${products.length} products`,
      );

      return {
        products,
        overall_profit_margin_percentage,
        date_range: {
          start,
          end,
        },
      };
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred while generating profit margin report',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in getProfitMargin function: ${errorMessage}`,
      );
    }
  }

  async getLowStockProducts(): Promise<Product[]> {
    try {
      const productRepository = await this.getProductRepository();
      this.logger.log('Fetching low stock products based on min_stock_level');

      // Find products with stock quantity below their minimum stock level
      const products = await productRepository
        .createQueryBuilder('product')
        .innerJoinAndSelect('product.category', 'category')
        .innerJoinAndSelect('product.supplier', 'supplier')
        .where('product.stock_quantity < product.min_stock_level')
        .andWhere('product.min_stock_level > 0') // Only consider products that have a minimum stock level set
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
