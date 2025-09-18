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
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryService } from './category.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Role } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entity/user.entity';
import { ApiResponseHelper } from '../common/helpers/api-response.helper';
import { SuccessResponse } from '../common/types/api-response.type';
import { CategoryResponseDto } from './dto/category-response.dto';
import { AppReadyGuard } from '../dynamic-database/guards/app-ready.guard';

@Controller('category')
@UseGuards(AuthGuard, RoleGuard, AppReadyGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @Role(UserRole.ADMIN)
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<SuccessResponse<CategoryResponseDto>> {
    const result = await this.categoryService.create(createCategoryDto);
    return ApiResponseHelper.success(result, 'Category created successfully');
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(): Promise<SuccessResponse<CategoryResponseDto[]>> {
    const result = await this.categoryService.findAll();
    return ApiResponseHelper.success(
      result,
      'Categories retrieved successfully',
    );
  }

  @HttpCode(HttpStatus.OK)
  @Put(':id')
  @Role(UserRole.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<SuccessResponse<CategoryResponseDto>> {
    const result = await this.categoryService.update(id, updateCategoryDto);
    return ApiResponseHelper.success(result, 'Category updated successfully');
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  @Role(UserRole.ADMIN)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<null>> {
    await this.categoryService.remove(id);
    return ApiResponseHelper.success(null, 'Category deleted successfully');
  }
}
