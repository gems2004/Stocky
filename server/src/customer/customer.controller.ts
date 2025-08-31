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

@Controller('customer')
@UseGuards(AuthGuard, RoleGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @Role(UserRole.ADMIN)
  async create(
    @Body() createCustomerDto: CreateCustomerDto,
  ): Promise<SuccessResponse<CustomerResponseDto>> {
    const result = await this.customerService.create(createCustomerDto);
    return ApiResponseHelper.success(result, 'Customer created successfully');
  }

  @HttpCode(HttpStatus.OK)
  @Get()
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
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<null>> {
    await this.customerService.remove(id);
    return ApiResponseHelper.success(null, 'Customer deleted successfully');
  }
}
