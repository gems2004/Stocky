import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITransactionService } from './interfaces/transaction.service.interface';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { Transaction } from './entity/transaction.entity';
import { TransactionItem } from './entity/transaction-item.entity';
import { Product } from '../product/entity/product.entity';
import { CustomException } from '../common/exceptions/custom.exception';
import { LoggerService } from '../common/logger.service';

@Injectable()
export class TransactionService implements ITransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(TransactionItem)
    private readonly transactionItemRepository: Repository<TransactionItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly logger: LoggerService,
  ) {}

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
      this.logger.log(`Fetching transactions - page: ${page}, limit: ${limit}`);

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Find transactions with pagination
      const [transactions, total] =
        await this.transactionRepository.findAndCount({
          relations: ['user', 'transactionItems'],
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
      this.logger.log(`Fetching transaction with ID: ${id}`);

      const transaction = await this.transactionRepository.findOne({
        where: { id },
        relations: ['user', 'transactionItems'],
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
      this.logger.log('Creating a new transaction');

      // 1. Validate product availability
      for (const item of transactionData.items) {
        const product = await this.productRepository.findOne({
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
        const product = await this.productRepository.findOne({
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
      const newTransaction = this.transactionRepository.create({
        customer_id: transactionData.customerId,
        user_id: transactionData.userId,
        total_amount: totalAmount,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        payment_method: transactionData.paymentMethod,
        status: transactionData.status || 'completed',
      });

      const savedTransaction =
        await this.transactionRepository.save(newTransaction);

      // 4. Create transaction items
      const transactionItemsToSave = transactionItemsData.map((itemData) =>
        this.transactionItemRepository.create({
          transaction_id: savedTransaction.id,
          product_id: itemData.product_id,
          quantity: itemData.quantity,
          unit_price: itemData.unit_price,
          total_price: itemData.total_price,
        }),
      );

      const savedTransactionItems = await this.transactionItemRepository.save(
        transactionItemsToSave,
      );

      // 5. Update inventory
      for (const item of transactionData.items) {
        const product = await this.productRepository.findOne({
          where: { id: item.productId },
        });

        // We already validated product existence and stock earlier,
        // so we can safely assert product is not null here.
        product!.stock_quantity -= item.quantity;
        await this.productRepository.save(product!);
      }

      this.logger.log(
        `Successfully created transaction with ID: ${savedTransaction.id}`,
      );

      // Fetch the user details to include in the response
      const user = await this.transactionRepository
        .findOne({
          where: { id: savedTransaction.user_id },
          relations: ['user'],
        })
        .then((result) => result?.user);

      // 7. Return result
      const transactionResponseDto: TransactionResponseDto = {
        id: savedTransaction.id,
        customerId: savedTransaction.customer_id,
        userId: savedTransaction.user_id,
        user: user
          ? {
              id: user.id,
              username: user.username,
              email: user.email,
              firstName: user.first_name,
              lastName: user.last_name,
              role: user.role,
              is_active: user.is_active,
              created_at: user.created_at,
              updated_at: user.updated_at,
            }
          : undefined,
        totalAmount: Number(savedTransaction.total_amount),
        taxAmount: Number(savedTransaction.tax_amount),
        discountAmount: Number(savedTransaction.discount_amount),
        paymentMethod: savedTransaction.payment_method,
        status: savedTransaction.status,
        createdAt: savedTransaction.created_at,
        transactionItems: savedTransactionItems.map((item) => ({
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
      this.logger.log(`Updating transaction with ID: ${id}`);

      // Find the existing transaction with its items
      const existingTransaction = await this.transactionRepository.findOne({
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
        const product = await this.productRepository.findOne({
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
        const product = await this.productRepository.findOne({
          where: { id: item.product_id },
        });

        if (product) {
          // Revert the quantity that was deducted
          product.stock_quantity += item.quantity;
          await this.productRepository.save(product);
        }
      }

      // Apply new quantities and calculate new totals
      const transactionItemsData: Partial<TransactionItem>[] = [];
      for (const item of itemsToUpdate) {
        const product = await this.productRepository.findOne({
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
          await this.productRepository.save(product);
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
        await this.transactionRepository.save(existingTransaction);

      // Remove existing transaction items
      if (
        existingTransaction.transactionItems &&
        existingTransaction.transactionItems.length > 0
      ) {
        await this.transactionItemRepository.remove(
          existingTransaction.transactionItems,
        );
      }

      // Create new transaction items
      const transactionItemsToSave = transactionItemsData.map((itemData) =>
        this.transactionItemRepository.create({
          transaction_id: updatedTransaction.id,
          product_id: itemData.product_id,
          quantity: itemData.quantity,
          unit_price: itemData.unit_price,
          total_price: itemData.total_price,
        }),
      );

      const savedTransactionItems = await this.transactionItemRepository.save(
        transactionItemsToSave,
      );

      this.logger.log(
        `Successfully updated transaction with ID: ${updatedTransaction.id}`,
      );

      // Fetch the user details to include in the response
      const user = await this.transactionRepository
        .findOne({
          where: { id: updatedTransaction.user_id },
          relations: ['user'],
        })
        .then((result) => result?.user);

      // Return result
      const transactionResponseDto: TransactionResponseDto = {
        id: updatedTransaction.id,
        customerId: updatedTransaction.customer_id,
        userId: updatedTransaction.user_id,
        user: user
          ? {
              id: user.id,
              username: user.username,
              email: user.email,
              firstName: user.first_name,
              lastName: user.last_name,
              role: user.role,
              is_active: user.is_active,
              created_at: user.created_at,
              updated_at: user.updated_at,
            }
          : undefined,
        totalAmount: Number(updatedTransaction.total_amount),
        taxAmount: Number(updatedTransaction.tax_amount),
        discountAmount: Number(updatedTransaction.discount_amount),
        paymentMethod: updatedTransaction.payment_method,
        status: updatedTransaction.status,
        createdAt: updatedTransaction.created_at,
        transactionItems: savedTransactionItems.map((item) => ({
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
      this.logger.log(`Attempting to delete transaction ID: ${id}`);

      // Find transaction by ID with its items
      const transaction = await this.transactionRepository.findOne({
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
        await this.transactionItemRepository.remove(
          transaction.transactionItems,
        );
      }

      // Delete the transaction
      await this.transactionRepository.remove(transaction);
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
