import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Put,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerService } from './customer.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Role } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entity/user.entity';
import { ApiResponseHelper } from '../common/helpers/api-response.helper';
import { SuccessResponse } from '../common/types/api-response.type';
import { CustomerResponseDto } from './dto/customer-response.dto';
import { AppReadyGuard } from '../dynamic-database/guards/app-ready.guard';

@ApiTags('Customer')
@Controller('customer')
@UseGuards(AuthGuard, RoleGuard, AppReadyGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @Role(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiBody({
    type: CreateCustomerDto,
    examples: {
      example1: {
        summary: 'Sample customer creation payload',
        value: {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          address: '123 Main St, City, Country',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Customer created successfully',
    schema: {
      example: {
        success: true,
        message: 'Customer created successfully',
        data: {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          address: '123 Main St, City, Country',
          created_at: '2025-01-01T00:00:00.000Z',
          updated_at: '2025-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        success: false,
        message: 'Unauthorized',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
    schema: {
      example: {
        success: false,
        message: 'Forbidden',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
    schema: {
      example: {
        success: false,
        message: 'Validation failed',
        data: null,
      },
    },
  })
  async create(
    @Body() createCustomerDto: CreateCustomerDto,
  ): Promise<SuccessResponse<CustomerResponseDto>> {
    const result = await this.customerService.create(createCustomerDto);
    return ApiResponseHelper.success(result, 'Customer created successfully');
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  @ApiResponse({
    status: 200,
    description: 'Customers retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Customers retrieved successfully',
        data: [
          {
            id: 1,
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890',
            address: '123 Main St, City, Country',
            created_at: '2025-01-01T00:00:00.000Z',
            updated_at: '2025-01-01T00:00:00.000Z',
          },
          {
            id: 2,
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane.smith@example.com',
            phone: '+0987654321',
            address: '456 Oak Ave, City, Country',
            created_at: '2025-01-02T00:00:00.000Z',
            updated_at: '2025-01-02T00:00:00.000Z',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        success: false,
        message: 'Unauthorized',
        data: null,
      },
    },
  })
  async findAll(): Promise<SuccessResponse<CustomerResponseDto[]>> {
    const result = await this.customerService.findAll();
    return ApiResponseHelper.success(
      result,
      'Customers retrieved successfully',
    );
  }

  @HttpCode(HttpStatus.OK)
  @Put(':id')
  @Role(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a customer by ID' })
  @ApiBody({
    type: UpdateCustomerDto,
    examples: {
      example1: {
        summary: 'Sample customer update payload',
        value: {
          first_name: 'Updated John',
          last_name: 'Updated Doe',
          email: 'updated.john.doe@example.com',
          phone: '+1234567890',
          address: '123 Updated Main St, City, Country',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Customer updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Customer updated successfully',
        data: {
          id: 1,
          first_name: 'Updated John',
          last_name: 'Updated Doe',
          email: 'updated.john.doe@example.com',
          phone: '+1234567890',
          address: '123 Updated Main St, City, Country',
          created_at: '2025-01-01T00:00:00.000Z',
          updated_at: '2025-01-02T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        success: false,
        message: 'Unauthorized',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
    schema: {
      example: {
        success: false,
        message: 'Forbidden',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Customer not found',
    schema: {
      example: {
        success: false,
        message: 'Customer not found',
        data: null,
      },
    },
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<SuccessResponse<CustomerResponseDto>> {
    const result = await this.customerService.update(id, updateCustomerDto);
    return ApiResponseHelper.success(result, 'Customer updated successfully');
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  @Role(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a customer by ID' })
  @ApiResponse({
    status: 200,
    description: 'Customer deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Customer deleted successfully',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        success: false,
        message: 'Unauthorized',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
    schema: {
      example: {
        success: false,
        message: 'Forbidden',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Customer not found',
    schema: {
      example: {
        success: false,
        message: 'Customer not found',
        data: null,
      },
    },
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<null>> {
    await this.customerService.remove(id);
    return ApiResponseHelper.success(null, 'Customer deleted successfully');
  }
}
