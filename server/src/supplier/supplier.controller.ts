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

@Controller('supplier')
@UseGuards(AuthGuard, RoleGuard)
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @Role(UserRole.ADMIN)
  async create(
    @Body() createSupplierDto: CreateSupplierDto,
  ): Promise<SuccessResponse<SupplierResponseDto>> {
    const result = await this.supplierService.create(createSupplierDto);
    return ApiResponseHelper.success(result, 'Supplier created successfully');
  }

  @HttpCode(HttpStatus.OK)
  @Get()
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
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<null>> {
    await this.supplierService.remove(id);
    return ApiResponseHelper.success(null, 'Supplier deleted successfully');
  }
}
