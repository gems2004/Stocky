import { Injectable, HttpStatus, Inject } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { ICustomerService } from './interfaces/customer.service.interface';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerResponseDto } from './dto/customer-response.dto';
import { CustomException } from '../common/exceptions/custom.exception';
import { LoggerService } from '../common/logger.service';
import { DynamicDatabaseService } from '../dynamic-database/dynamic-database.service';

@Injectable()
export class CustomerService implements ICustomerService {
  constructor(
    private readonly dynamicDatabaseService: DynamicDatabaseService,
    private readonly logger: LoggerService,
  ) {
    // No initialization in constructor
  }

  private async getCustomerRepository(): Promise<Repository<Customer>> {
    try {
      // Ensure the database is ready
      await this.ensureDatabaseReady();
      this.dynamicDatabaseService.ensureDataSourceInitialized();
      const dataSource = this.dynamicDatabaseService.getDataSource();
      return dataSource.getRepository(Customer);
    } catch (error) {
      this.logger.error(`Failed to get customer repository: ${error.message}`);
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

  async create(
    createCustomerDto: CreateCustomerDto,
  ): Promise<CustomerResponseDto> {
    try {
      const customerRepository = await this.getCustomerRepository();
      this.logger.log(
        `Attempting to create customer: ${createCustomerDto.first_name} ${createCustomerDto.last_name}`,
      );

      // Check if customer with same email already exists (if email is provided)
      if (createCustomerDto.email) {
        const existingCustomer = await customerRepository.findOne({
          where: { email: createCustomerDto.email },
        });

        if (existingCustomer) {
          const errorMsg = `Customer with this email already exists: ${createCustomerDto.email}`;
          throw new CustomException(
            'Customer with this email already exists',
            HttpStatus.CONFLICT,
            errorMsg,
          );
        }
      }

      // Create new customer entity
      const newCustomer = customerRepository.create({
        first_name: createCustomerDto.first_name,
        last_name: createCustomerDto.last_name,
        email: createCustomerDto.email,
        phone: createCustomerDto.phone,
        address: createCustomerDto.address,
        loyalty_points: createCustomerDto.loyalty_points || 0,
      });

      // Save the customer
      const savedCustomer = await customerRepository.save(newCustomer);
      this.logger.log(
        `Successfully created customer with ID: ${savedCustomer.id}`,
      );

      // Construct response
      const customerResponse: CustomerResponseDto = {
        id: savedCustomer.id,
        first_name: savedCustomer.first_name,
        last_name: savedCustomer.last_name,
        email: savedCustomer.email,
        phone: savedCustomer.phone,
        address: savedCustomer.address,
        loyalty_points: savedCustomer.loyalty_points,
        created_at: savedCustomer.created_at,
      };

      return customerResponse;
    } catch (error) {
      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred during customer creation',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in create function: ${errorMessage}`,
      );
    }
  }

  async findAll(): Promise<CustomerResponseDto[]> {
    try {
      const customerRepository = await this.getCustomerRepository();
      this.logger.log('Fetching all customers');

      // Find all customers
      const customers = await customerRepository.find({
        order: { first_name: 'ASC', last_name: 'ASC' },
      });

      this.logger.log(`Successfully fetched ${customers.length} customers`);

      // Map to response DTOs
      const customerResponses: CustomerResponseDto[] = customers.map(
        (customer) => ({
          id: customer.id,
          first_name: customer.first_name,
          last_name: customer.last_name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          loyalty_points: customer.loyalty_points,
          created_at: customer.created_at,
        }),
      );

      return customerResponses;
    } catch (error) {
      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred while fetching all customers',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in findAll function: ${errorMessage}`,
      );
    }
  }

  async update(
    id: number,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    try {
      const customerRepository = await this.getCustomerRepository();
      this.logger.log(`Attempting to update customer ID: ${id}`);

      // Find customer by ID
      const customer = await customerRepository.findOne({
        where: { id },
      });

      // If customer not found, throw exception
      if (!customer) {
        const errorMsg = `Customer not found with ID: ${id}`;
        throw new CustomException(
          'Customer not found',
          HttpStatus.NOT_FOUND,
          errorMsg,
        );
      }

      // Check if email is being updated and if it already exists
      if (
        updateCustomerDto.email &&
        updateCustomerDto.email !== customer.email
      ) {
        const existingCustomer = await customerRepository.findOne({
          where: { email: updateCustomerDto.email },
        });

        if (existingCustomer) {
          const errorMsg = `Customer with this email already exists: ${updateCustomerDto.email}`;
          throw new CustomException(
            'Customer with this email already exists',
            HttpStatus.CONFLICT,
            errorMsg,
          );
        }
      }

      // Update customer properties
      if (updateCustomerDto.first_name !== undefined) {
        customer.first_name = updateCustomerDto.first_name;
      }
      if (updateCustomerDto.last_name !== undefined) {
        customer.last_name = updateCustomerDto.last_name;
      }
      if (updateCustomerDto.email !== undefined) {
        customer.email = updateCustomerDto.email;
      }
      if (updateCustomerDto.phone !== undefined) {
        customer.phone = updateCustomerDto.phone;
      }
      if (updateCustomerDto.address !== undefined) {
        customer.address = updateCustomerDto.address;
      }
      if (updateCustomerDto.loyalty_points !== undefined) {
        customer.loyalty_points = updateCustomerDto.loyalty_points;
      }

      // Save the updated customer
      const updatedCustomer = await customerRepository.save(customer);
      this.logger.log(
        `Successfully updated customer with ID: ${updatedCustomer.id}`,
      );

      // Construct response
      const customerResponse: CustomerResponseDto = {
        id: updatedCustomer.id,
        first_name: updatedCustomer.first_name,
        last_name: updatedCustomer.last_name,
        email: updatedCustomer.email,
        phone: updatedCustomer.phone,
        address: updatedCustomer.address,
        loyalty_points: updatedCustomer.loyalty_points,
        created_at: updatedCustomer.created_at,
      };

      return customerResponse;
    } catch (error) {
      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred during customer update',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in update function: ${errorMessage}`,
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const customerRepository = await this.getCustomerRepository();
      this.logger.log(`Attempting to remove customer ID: ${id}`);

      // Find customer by ID
      const customer = await customerRepository.findOne({
        where: { id },
      });

      // If customer not found, throw exception
      if (!customer) {
        const errorMsg = `Customer not found with ID: ${id}`;
        throw new CustomException(
          'Customer not found',
          HttpStatus.NOT_FOUND,
          errorMsg,
        );
      }

      // Remove the customer
      await customerRepository.remove(customer);
      this.logger.log(`Successfully removed customer with ID: ${id}`);
    } catch (error) {
      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred during customer removal',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in remove function: ${errorMessage}`,
      );
    }
  }
}
