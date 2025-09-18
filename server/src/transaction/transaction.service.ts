import { Injectable, HttpStatus, Inject } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { ITransactionService } from './interfaces/transaction.service.interface';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { Transaction } from './entity/transaction.entity';
import { TransactionItem } from './entity/transaction-item.entity';
import { Product } from '../product/entity/product.entity';
import { CustomException } from '../common/exceptions/custom.exception';
import { LoggerService } from '../common/logger.service';
import { DynamicDatabaseService } from '../dynamic-database/dynamic-database.service';

@Injectable()
export class TransactionService implements ITransactionService {
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
      this.logger.error(`Failed to get transaction repository: ${error.message}`);
      throw new CustomException(
        'Database connection error',
        HttpStatus.SERVICE_UNAVAILABLE,
        `Database may not be properly configured: ${error.message}`,
      );
    }
  }

  private async getTransactionItemRepository(): Promise<Repository<TransactionItem>> {
    try {
      // Ensure the database is ready
      await this.ensureDatabaseReady();
      this.dynamicDatabaseService.ensureDataSourceInitialized();
      const dataSource = this.dynamicDatabaseService.getDataSource();
      return dataSource.getRepository(TransactionItem);
    } catch (error) {
      this.logger.error(`Failed to get transaction item repository: ${error.message}`);
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

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: TransactionResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const transactionRepository = await this.getTransactionRepository();
      this.logger.log(`Fetching transactions - page: ${page}, limit: ${limit}`);

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Find transactions with pagination
      const [transactions, total] =
        await transactionRepository.findAndCount({
          relations: ['user', 'transactionItems', 'customer'],
          order: { created_at: 'DESC' },
          skip: offset,
          take: limit,
        });

      this.logger.log(
        `Successfully fetched ${transactions.length} transactions`,
      );

      // Map entities to DTOs
      const transactionResponses: TransactionResponseDto[] = transactions.map(
        (transaction) => ({
          id: transaction.id,
          customerId: transaction.customer_id,
          customer: transaction.customer
            ? {
                id: transaction.customer.id,
                first_name: transaction.customer.first_name,
                last_name: transaction.customer.last_name,
                email: transaction.customer.email,
                phone: transaction.customer.phone,
                address: transaction.customer.address,
                loyalty_points: transaction.customer.loyalty_points,
                created_at: transaction.customer.created_at,
              }
            : undefined,
          userId: transaction.user_id,
          user: transaction.user
            ? {
                id: transaction.user.id,
                username: transaction.user.username,
                email: transaction.user.email,
                firstName: transaction.user.first_name,
                lastName: transaction.user.last_name,
                role: transaction.user.role,
                is_active: transaction.user.is_active,
                created_at: transaction.user.created_at,
                updated_at: transaction.user.updated_at,
              }
            : undefined,
          totalAmount: Number(transaction.total_amount),
          taxAmount: Number(transaction.tax_amount),
          discountAmount: Number(transaction.discount_amount),
          paymentMethod: transaction.payment_method,
          status: transaction.status,
          createdAt: transaction.created_at,
          transactionItems: transaction.transactionItems.map((item) => ({
            id: item.id,
            productId: item.product_id,
            quantity: item.quantity,
            unitPrice: Number(item.unit_price),
            totalPrice: Number(item.total_price),
          })),
        }),
      );

      return {
        data: transactionResponses,
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
        'An unexpected error occurred while fetching transactions',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in findAll function: ${errorMessage}`,
      );
    }
  }

  async findOne(id: number): Promise<TransactionResponseDto> {
    try {
      const transactionRepository = await this.getTransactionRepository();
      this.logger.log(`Fetching transaction with ID: ${id}`);

      const transaction = await transactionRepository.findOne({
        where: { id },
        relations: ['user', 'transactionItems', 'customer'],
      });

      // If transaction not found, throw exception
      if (!transaction) {
        const errorMsg = `Transaction not found with ID: ${id}`;
        throw new CustomException(
          'Transaction not found',
          HttpStatus.NOT_FOUND,
          errorMsg,
        );
      }

      this.logger.log(`Successfully fetched transaction with ID: ${id}`);

      // Map entity to DTO
      const transactionResponseDto: TransactionResponseDto = {
        id: transaction.id,
        customerId: transaction.customer_id,
        customer: transaction.customer
          ? {
              id: transaction.customer.id,
              first_name: transaction.customer.first_name,
              last_name: transaction.customer.last_name,
              email: transaction.customer.email,
              phone: transaction.customer.phone,
              address: transaction.customer.address,
              loyalty_points: transaction.customer.loyalty_points,
              created_at: transaction.customer.created_at,
            }
          : undefined,
        userId: transaction.user_id,
        user: transaction.user
          ? {
              id: transaction.user.id,
              username: transaction.user.username,
              email: transaction.user.email,
              firstName: transaction.user.first_name,
              lastName: transaction.user.last_name,
              role: transaction.user.role,
              is_active: transaction.user.is_active,
              created_at: transaction.user.created_at,
              updated_at: transaction.user.updated_at,
            }
          : undefined,
        totalAmount: Number(transaction.total_amount),
        taxAmount: Number(transaction.tax_amount),
        discountAmount: Number(transaction.discount_amount),
        paymentMethod: transaction.payment_method,
        status: transaction.status,
        createdAt: transaction.created_at,
        transactionItems: transaction.transactionItems.map((item) => ({
          id: item.id,
          productId: item.product_id,
          quantity: item.quantity,
          unitPrice: Number(item.unit_price),
          totalPrice: Number(item.total_price),
        })),
      };

      return transactionResponseDto;
    } catch (error) {
      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred while fetching transaction',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in findOne function: ${errorMessage}`,
      );
    }
  }

  async create(
    transactionData: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    try {
      const transactionRepository = await this.getTransactionRepository();
      const transactionItemRepository = await this.getTransactionItemRepository();
      const productRepository = await this.getProductRepository();
      this.logger.log('Creating a new transaction');

      // 1. Validate product availability
      for (const item of transactionData.items) {
        const product = await productRepository.findOne({
          where: { id: item.productId },
        });

        if (!product) {
          const errorMsg = `Product not found with ID: ${item.productId}`;
          throw new CustomException(
            'Product not found',
            HttpStatus.NOT_FOUND,
            errorMsg,
          );
        }

        if (product.stock_quantity < item.quantity) {
          const errorMsg = `Insufficient stock for product: ${product.name}. Available: ${product.stock_quantity}, Requested: ${item.quantity}`;
          throw new CustomException(
            'Insufficient stock for product',
            HttpStatus.BAD_REQUEST,
            errorMsg,
          );
        }
      }

      // 2. Calculate totals
      let subtotal = 0;
      const transactionItemsData: Partial<TransactionItem>[] = [];

      for (const item of transactionData.items) {
        const product = await productRepository.findOne({
          where: { id: item.productId },
        });

        const totalPrice = Number((item.quantity * item.unitPrice).toFixed(2));
        subtotal += totalPrice;

        transactionItemsData.push({
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: totalPrice,
        });
      }

      const taxAmount = transactionData.taxAmount || 0;
      const discountAmount = transactionData.discountAmount || 0;
      const totalAmount = Number(
        (subtotal + taxAmount - discountAmount).toFixed(2),
      );

      // 3. Create transaction record
      const newTransaction = transactionRepository.create({
        customer_id: transactionData.customerId,
        user_id: transactionData.userId,
        total_amount: totalAmount,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        payment_method: transactionData.paymentMethod,
        status: transactionData.status || 'completed',
      });

      const savedTransaction =
        await transactionRepository.save(newTransaction);

      // 4. Create transaction items
      const transactionItemsToSave = transactionItemsData.map((itemData) =>
        transactionItemRepository.create({
          transaction_id: savedTransaction.id,
          product_id: itemData.product_id,
          quantity: itemData.quantity,
          unit_price: itemData.unit_price,
          total_price: itemData.total_price,
        }),
      );

      const savedTransactionItems = await transactionItemRepository.save(
        transactionItemsToSave,
      );

      // 5. Update inventory
      for (const item of transactionData.items) {
        const product = await productRepository.findOne({
          where: { id: item.productId },
        });

        // We already validated product existence and stock earlier,
        // so we can safely assert product is not null here.
        product!.stock_quantity -= item.quantity;
        await productRepository.save(product!);
      }

      this.logger.log(
        `Successfully created transaction with ID: ${savedTransaction.id}`,
      );

      // Fetch the complete transaction with relations for response
      const completeTransaction = await transactionRepository.findOne({
        where: { id: savedTransaction.id },
        relations: ['user', 'transactionItems', 'customer'],
      });

      if (!completeTransaction) {
        throw new CustomException(
          'Failed to retrieve created transaction',
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Transaction was created but could not be retrieved',
        );
      }

      // 7. Return result
      const transactionResponseDto: TransactionResponseDto = {
        id: completeTransaction.id,
        customerId: completeTransaction.customer_id,
        customer: completeTransaction.customer
          ? {
              id: completeTransaction.customer.id,
              first_name: completeTransaction.customer.first_name,
              last_name: completeTransaction.customer.last_name,
              email: completeTransaction.customer.email,
              phone: completeTransaction.customer.phone,
              address: completeTransaction.customer.address,
              loyalty_points: completeTransaction.customer.loyalty_points,
              created_at: completeTransaction.customer.created_at,
            }
          : undefined,
        userId: completeTransaction.user_id,
        user: completeTransaction.user
          ? {
              id: completeTransaction.user.id,
              username: completeTransaction.user.username,
              email: completeTransaction.user.email,
              firstName: completeTransaction.user.first_name,
              lastName: completeTransaction.user.last_name,
              role: completeTransaction.user.role,
              is_active: completeTransaction.user.is_active,
              created_at: completeTransaction.user.created_at,
              updated_at: completeTransaction.user.updated_at,
            }
          : undefined,
        totalAmount: Number(completeTransaction.total_amount),
        taxAmount: Number(completeTransaction.tax_amount),
        discountAmount: Number(completeTransaction.discount_amount),
        paymentMethod: completeTransaction.payment_method,
        status: completeTransaction.status,
        createdAt: completeTransaction.created_at,
        transactionItems: completeTransaction.transactionItems.map((item) => ({
          id: item.id,
          productId: item.product_id,
          quantity: item.quantity,
          unitPrice: Number(item.unit_price),
          totalPrice: Number(item.total_price),
        })),
      };

      return transactionResponseDto;
    } catch (error) {
      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred during transaction creation',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in create function: ${errorMessage}`,
      );
    }
  }

  async update(
    id: number,
    transactionData: UpdateTransactionDto,
  ): Promise<TransactionResponseDto> {
    try {
      const transactionRepository = await this.getTransactionRepository();
      const transactionItemRepository = await this.getTransactionItemRepository();
      const productRepository = await this.getProductRepository();
      this.logger.log(`Updating transaction with ID: ${id}`);

      // Find the existing transaction with its items
      const existingTransaction = await transactionRepository.findOne({
        where: { id },
        relations: ['transactionItems'],
      });

      // If transaction not found, throw exception
      if (!existingTransaction) {
        const errorMsg = `Transaction not found with ID: ${id}`;
        throw new CustomException(
          'Transaction not found',
          HttpStatus.NOT_FOUND,
          errorMsg,
        );
      }

      // Get the items to update (if provided) or use existing items
      const itemsToUpdate =
        transactionData.items ||
        existingTransaction.transactionItems.map((item) => ({
          productId: item.product_id,
          quantity: item.quantity,
          unitPrice: Number(item.unit_price),
        }));

      // Validate product availability for new items
      for (const item of itemsToUpdate) {
        const product = await productRepository.findOne({
          where: { id: item.productId },
        });

        if (!product) {
          const errorMsg = `Product not found with ID: ${item.productId}`;
          throw new CustomException(
            'Product not found',
            HttpStatus.NOT_FOUND,
            errorMsg,
          );
        }

        // Check stock availability
        // If this is an existing item, we need to account for the current quantity
        const existingItem = existingTransaction.transactionItems.find(
          (i) => i.product_id === item.productId,
        );

        let requiredStock = item.quantity;
        if (existingItem) {
          // If item exists, we're updating the quantity
          // Only check stock for the difference
          requiredStock = item.quantity - existingItem.quantity;
        }

        // Check if we have enough stock (considering we might be returning some)
        if (requiredStock > 0 && product.stock_quantity < requiredStock) {
          const errorMsg = `Insufficient stock for product: ${product.name}. Available: ${product.stock_quantity}, Requested: ${requiredStock}`;
          throw new CustomException(
            'Insufficient stock for product',
            HttpStatus.BAD_REQUEST,
            errorMsg,
          );
        }
      }

      // Calculate new totals
      let subtotal = 0;

      // Update inventory: first revert the old quantities
      for (const item of existingTransaction.transactionItems) {
        const product = await productRepository.findOne({
          where: { id: item.product_id },
        });

        if (product) {
          // Revert the quantity that was deducted
          product.stock_quantity += item.quantity;
          await productRepository.save(product);
        }
      }

      // Apply new quantities and calculate new totals
      const transactionItemsData: Partial<TransactionItem>[] = [];
      for (const item of itemsToUpdate) {
        const product = await productRepository.findOne({
          where: { id: item.productId },
        });

        const totalPrice = Number((item.quantity * item.unitPrice).toFixed(2));
        subtotal += totalPrice;

        transactionItemsData.push({
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: totalPrice,
        });

        // Update inventory with new quantities
        if (product) {
          product.stock_quantity -= item.quantity;
          await productRepository.save(product);
        }
      }

      // Calculate new transaction totals
      const taxAmount =
        transactionData.taxAmount !== undefined
          ? transactionData.taxAmount
          : Number(existingTransaction.tax_amount);
      const discountAmount =
        transactionData.discountAmount !== undefined
          ? transactionData.discountAmount
          : Number(existingTransaction.discount_amount);
      const totalAmount = Number(
        (subtotal + taxAmount - discountAmount).toFixed(2),
      );

      // Update transaction properties
      if (transactionData.customerId !== undefined) {
        existingTransaction.customer_id = transactionData.customerId;
      }
      if (transactionData.userId !== undefined) {
        existingTransaction.user_id = transactionData.userId;
      }
      existingTransaction.total_amount = totalAmount;
      existingTransaction.tax_amount = taxAmount;
      existingTransaction.discount_amount = discountAmount;
      if (transactionData.paymentMethod !== undefined) {
        existingTransaction.payment_method = transactionData.paymentMethod;
      }
      if (transactionData.status !== undefined) {
        existingTransaction.status = transactionData.status;
      }

      // Save the updated transaction
      const updatedTransaction =
        await transactionRepository.save(existingTransaction);

      // Remove existing transaction items
      if (
        existingTransaction.transactionItems &&
        existingTransaction.transactionItems.length > 0
      ) {
        await transactionItemRepository.remove(
          existingTransaction.transactionItems,
        );
      }

      // Create new transaction items
      const transactionItemsToSave = transactionItemsData.map((itemData) =>
        transactionItemRepository.create({
          transaction_id: updatedTransaction.id,
          product_id: itemData.product_id,
          quantity: itemData.quantity,
          unit_price: itemData.unit_price,
          total_price: itemData.total_price,
        }),
      );

      const savedTransactionItems = await transactionItemRepository.save(
        transactionItemsToSave,
      );

      this.logger.log(
        `Successfully updated transaction with ID: ${updatedTransaction.id}`,
      );

      // Fetch the complete transaction with relations for response
      const completeTransaction = await transactionRepository.findOne({
        where: { id: updatedTransaction.id },
        relations: ['user', 'transactionItems', 'customer'],
      });

      if (!completeTransaction) {
        throw new CustomException(
          'Failed to retrieve updated transaction',
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Transaction was updated but could not be retrieved',
        );
      }

      // Return result
      const transactionResponseDto: TransactionResponseDto = {
        id: completeTransaction.id,
        customerId: completeTransaction.customer_id,
        customer: completeTransaction.customer
          ? {
              id: completeTransaction.customer.id,
              first_name: completeTransaction.customer.first_name,
              last_name: completeTransaction.customer.last_name,
              email: completeTransaction.customer.email,
              phone: completeTransaction.customer.phone,
              address: completeTransaction.customer.address,
              loyalty_points: completeTransaction.customer.loyalty_points,
              created_at: completeTransaction.customer.created_at,
            }
          : undefined,
        userId: completeTransaction.user_id,
        user: completeTransaction.user
          ? {
              id: completeTransaction.user.id,
              username: completeTransaction.user.username,
              email: completeTransaction.user.email,
              firstName: completeTransaction.user.first_name,
              lastName: completeTransaction.user.last_name,
              role: completeTransaction.user.role,
              is_active: completeTransaction.user.is_active,
              created_at: completeTransaction.user.created_at,
              updated_at: completeTransaction.user.updated_at,
            }
          : undefined,
        totalAmount: Number(completeTransaction.total_amount),
        taxAmount: Number(completeTransaction.tax_amount),
        discountAmount: Number(completeTransaction.discount_amount),
        paymentMethod: completeTransaction.payment_method,
        status: completeTransaction.status,
        createdAt: completeTransaction.created_at,
        transactionItems: completeTransaction.transactionItems.map((item) => ({
          id: item.id,
          productId: item.product_id,
          quantity: item.quantity,
          unitPrice: Number(item.unit_price),
          totalPrice: Number(item.total_price),
        })),
      };

      return transactionResponseDto;
    } catch (error) {
      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred during transaction update',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in update function: ${errorMessage}`,
      );
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const transactionRepository = await this.getTransactionRepository();
      const transactionItemRepository = await this.getTransactionItemRepository();
      this.logger.log(`Attempting to delete transaction ID: ${id}`);

      // Find transaction by ID with its items
      const transaction = await transactionRepository.findOne({
        where: { id },
        relations: ['transactionItems'],
      });

      // If transaction not found, throw exception
      if (!transaction) {
        const errorMsg = `Transaction not found with ID: ${id}`;
        throw new CustomException(
          'Transaction not found',
          HttpStatus.NOT_FOUND,
          errorMsg,
        );
      }

      // Delete transaction items first (due to foreign key constraints)
      if (
        transaction.transactionItems &&
        transaction.transactionItems.length > 0
      ) {
        await transactionItemRepository.remove(
          transaction.transactionItems,
        );
      }

      // Delete the transaction
      await transactionRepository.remove(transaction);
      this.logger.log(`Successfully deleted transaction with ID: ${id}`);
    } catch (error) {
      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred during transaction deletion',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in delete function: ${errorMessage}`,
      );
    }
  }
}
