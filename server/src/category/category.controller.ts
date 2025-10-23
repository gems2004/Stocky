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

@ApiTags('Category')
@Controller('category')
@UseGuards(AuthGuard, RoleGuard, AppReadyGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @Role(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new category' })
  @ApiBody({
    type: CreateCategoryDto,
    examples: {
      example1: {
        summary: 'Sample category creation payload',
        value: {
          name: 'Electronics',
          description: 'Electronic devices and accessories',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    schema: {
      example: {
        success: true,
        message: 'Category created successfully',
        data: {
          id: 1,
          name: 'Electronics',
          description: 'Electronic devices and accessories',
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
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<SuccessResponse<CategoryResponseDto>> {
    const result = await this.categoryService.create(createCategoryDto);
    return ApiResponseHelper.success(result, 'Category created successfully');
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Category retrieved successfully',
        data: {
          id: 1,
          name: 'Electronics',
          description: 'Electronic devices and accessories',
          created_at: '2025-01-01T00:00:00.000Z',
          updated_at: '2025-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
    schema: {
      example: {
        success: false,
        message: 'Category not found',
        data: null,
      },
    },
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<CategoryResponseDto>> {
    const result = await this.categoryService.findOne(id);
    return ApiResponseHelper.success(result, 'Category retrieved successfully');
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Categories retrieved successfully',
        data: [
          {
            id: 1,
            name: 'Electronics',
            description: 'Electronic devices and accessories',
            created_at: '2025-01-01T00:00:00.000Z',
            updated_at: '2025-01-01T00:00:00.000Z',
          },
          {
            id: 2,
            name: 'Clothing',
            description: 'Apparel and accessories',
            created_at: '2025-01-01T00:00:00.000Z',
            updated_at: '2025-01-01T00:00:00.000Z',
          },
        ],
      },
    },
  })
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
  @ApiOperation({ summary: 'Update a category by ID' })
  @ApiBody({
    type: UpdateCategoryDto,
    examples: {
      example1: {
        summary: 'Sample category update payload',
        value: {
          name: 'Updated Electronics',
          description: 'Updated electronic devices and accessories',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Category updated successfully',
        data: {
          id: 1,
          name: 'Updated Electronics',
          description: 'Updated electronic devices and accessories',
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
    description: 'Category not found',
    schema: {
      example: {
        success: false,
        message: 'Category not found',
        data: null,
      },
    },
  })
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
  @ApiOperation({ summary: 'Delete a category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Category deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Category deleted successfully',
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
    description: 'Category not found',
    schema: {
      example: {
        success: false,
        message: 'Category not found',
        data: null,
      },
    },
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<null>> {
    await this.categoryService.remove(id);
    return ApiResponseHelper.success(null, 'Category deleted successfully');
  }
}
