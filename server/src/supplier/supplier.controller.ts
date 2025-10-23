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
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierService } from './supplier.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Role } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entity/user.entity';
import { ApiResponseHelper } from '../common/helpers/api-response.helper';
import { SuccessResponse } from '../common/types/api-response.type';
import { SupplierResponseDto } from './dto/supplier-response.dto';
import { AppReadyGuard } from '../dynamic-database/guards/app-ready.guard';

@ApiTags('Supplier')
@Controller('supplier')
@UseGuards(AuthGuard, RoleGuard, AppReadyGuard)
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @Role(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new supplier' })
  @ApiBody({
    type: CreateSupplierDto,
    examples: {
      example1: {
        summary: 'Sample supplier creation payload',
        value: {
          name: 'ABC Electronics',
          contact_person: 'John Smith',
          email: 'contact@abcelectronics.com',
          phone: '+1234567890',
          address: '123 Supplier St, City, Country',
          description: 'Electronics supplier specializing in consumer goods',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Supplier created successfully',
    schema: {
      example: {
        success: true,
        message: 'Supplier created successfully',
        data: {
          id: 1,
          name: 'ABC Electronics',
          contact_person: 'John Smith',
          email: 'contact@abcelectronics.com',
          phone: '+1234567890',
          address: '123 Supplier St, City, Country',
          description: 'Electronics supplier specializing in consumer goods',
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
    @Body() createSupplierDto: CreateSupplierDto,
  ): Promise<SuccessResponse<SupplierResponseDto>> {
    const result = await this.supplierService.create(createSupplierDto);
    return ApiResponseHelper.success(result, 'Supplier created successfully');
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  @ApiOperation({ summary: 'Get all suppliers' })
  @ApiResponse({
    status: 200,
    description: 'Suppliers retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Suppliers retrieved successfully',
        data: [
          {
            id: 1,
            name: 'ABC Electronics',
            contact_person: 'John Smith',
            email: 'contact@abcelectronics.com',
            phone: '+1234567890',
            address: '123 Supplier St, City, Country',
            description: 'Electronics supplier specializing in consumer goods',
            created_at: '2025-01-01T00:00:00.000Z',
            updated_at: '2025-01-01T00:00:00.000Z',
          },
          {
            id: 2,
            name: 'XYZ Components',
            contact_person: 'Jane Doe',
            email: 'info@xyzcomponents.com',
            phone: '+0987654321',
            address: '456 Component Ave, City, Country',
            description: 'Component supplier for electronic devices',
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
  async findAll(): Promise<SuccessResponse<SupplierResponseDto[]>> {
    const result = await this.supplierService.findAll();
    return ApiResponseHelper.success(
      result,
      'Suppliers retrieved successfully',
    );
  }

  @HttpCode(HttpStatus.OK)
  @Put(':id')
  @Role(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a supplier by ID' })
  @ApiBody({
    type: UpdateSupplierDto,
    examples: {
      example1: {
        summary: 'Sample supplier update payload',
        value: {
          name: 'Updated ABC Electronics',
          contact_person: 'Updated John Smith',
          email: 'updated@abcelectronics.com',
          phone: '+1234567890',
          address: '123 Updated Supplier St, City, Country',
          description:
            'Updated electronics supplier specializing in consumer goods',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Supplier updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Supplier updated successfully',
        data: {
          id: 1,
          name: 'Updated ABC Electronics',
          contact_person: 'Updated John Smith',
          email: 'updated@abcelectronics.com',
          phone: '+1234567890',
          address: '123 Updated Supplier St, City, Country',
          description:
            'Updated electronics supplier specializing in consumer goods',
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
    description: 'Supplier not found',
    schema: {
      example: {
        success: false,
        message: 'Supplier not found',
        data: null,
      },
    },
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ): Promise<SuccessResponse<SupplierResponseDto>> {
    const result = await this.supplierService.update(id, updateSupplierDto);
    return ApiResponseHelper.success(result, 'Supplier updated successfully');
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  @Role(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a supplier by ID' })
  @ApiResponse({
    status: 200,
    description: 'Supplier deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Supplier deleted successfully',
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
    description: 'Supplier not found',
    schema: {
      example: {
        success: false,
        message: 'Supplier not found',
        data: null,
      },
    },
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<null>> {
    await this.supplierService.remove(id);
    return ApiResponseHelper.success(null, 'Supplier deleted successfully');
  }
}
