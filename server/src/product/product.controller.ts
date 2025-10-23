import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseIntPipe,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SearchProductDto } from './dto/search-product.dto';
import { FindAllProductsDto } from './dto/find-all-products.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ApiResponseHelper } from '../common/helpers/api-response.helper';
import { SuccessResponse } from '../common/types/api-response.type';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AppReadyGuard } from '../dynamic-database/guards/app-ready.guard';

@ApiTags('Products')
@Controller('products')
@UseGuards(AuthGuard, AppReadyGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @HttpCode(HttpStatus.OK)
  @Get('search')
  @ApiOperation({ summary: 'Search products with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Products search completed successfully',
    schema: {
      example: {
        success: true,
        message: 'Products search completed successfully',
        data: {
          data: [
            {
              id: 1,
              name: 'Laptop',
              description: 'High-performance laptop',
              price: 999.99,
              cost_price: 800.0,
              sku: 'LAP-001',
              barcode: '1234567890123',
              category_id: 1,
              supplier_id: 1,
              min_stock_level: 10,
              max_stock_level: 100,
              reorder_level: 20,
              current_stock: 15,
              created_at: '2025-01-01T00:00:00.000Z',
              updated_at: '2025-01-01T00:00:00.000Z',
              deleted_at: null,
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
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
  async search(@Query() searchProductDto: SearchProductDto): Promise<
    SuccessResponse<{
      data: ProductResponseDto[];
      total: number;
      page: number;
      limit: number;
    }>
  > {
    const result = await this.productService.search(searchProductDto);
    return ApiResponseHelper.success(
      result,
      'Products search completed successfully',
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  @ApiOperation({ summary: 'Get all products with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Products retrieved successfully',
        data: {
          data: [
            {
              id: 1,
              name: 'Laptop',
              description: 'High-performance laptop',
              price: 999.99,
              cost_price: 800.0,
              sku: 'LAP-001',
              barcode: '1234567890123',
              category_id: 1,
              supplier_id: 1,
              min_stock_level: 10,
              max_stock_level: 100,
              reorder_level: 20,
              current_stock: 15,
              created_at: '2025-01-01T00:00:00.000Z',
              updated_at: '2025-01-01T00:00:00.000Z',
              deleted_at: null,
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
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
  async findAll(@Query() findAllProductsDto: FindAllProductsDto): Promise<
    SuccessResponse<{
      data: ProductResponseDto[];
      total: number;
      page: number;
      limit: number;
    }>
  > {
    // Parse page and limit with default values
    const pageNum = findAllProductsDto.page
      ? parseInt(findAllProductsDto.page, 10)
      : 1;
    const limitNum = findAllProductsDto.limit
      ? parseInt(findAllProductsDto.limit, 10)
      : 10;

    // Parse category and supplier IDs if provided
    const categoryId = findAllProductsDto.categoryId
      ? parseInt(findAllProductsDto.categoryId, 10)
      : undefined;
    const supplierId = findAllProductsDto.supplierId
      ? parseInt(findAllProductsDto.supplierId, 10)
      : undefined;

    const result = await this.productService.findAll(
      pageNum,
      limitNum,
      categoryId,
      supplierId,
    );
    return ApiResponseHelper.success(result, 'Products retrieved successfully');
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Product retrieved successfully',
        data: {
          id: 1,
          name: 'Laptop',
          description: 'High-performance laptop',
          price: 999.99,
          cost_price: 800.0,
          sku: 'LAP-001',
          barcode: '1234567890123',
          category_id: 1,
          supplier_id: 1,
          min_stock_level: 10,
          max_stock_level: 100,
          reorder_level: 20,
          current_stock: 15,
          created_at: '2025-01-01T00:00:00.000Z',
          updated_at: '2025-01-01T00:00:00.000Z',
          deleted_at: null,
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
    status: 404,
    description: 'Product not found',
    schema: {
      example: {
        success: false,
        message: 'Product not found',
        data: null,
      },
    },
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<ProductResponseDto>> {
    const product = await this.productService.findOne(id);
    return ApiResponseHelper.success(product, 'Product retrieved successfully');
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiBody({
    type: CreateProductDto,
    examples: {
      example1: {
        summary: 'Sample product creation payload',
        value: {
          name: 'Laptop',
          description: 'High-performance laptop',
          price: 999.99,
          cost_price: 800.0,
          sku: 'LAP-001',
          barcode: '1234567890123',
          category_id: 1,
          supplier_id: 1,
          min_stock_level: 10,
          max_stock_level: 100,
          reorder_level: 20,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    schema: {
      example: {
        success: true,
        message: 'Product created successfully',
        data: {
          id: 1,
          name: 'Laptop',
          description: 'High-performance laptop',
          price: 999.99,
          cost_price: 800.0,
          sku: 'LAP-001',
          barcode: '1234567890123',
          category_id: 1,
          supplier_id: 1,
          min_stock_level: 10,
          max_stock_level: 100,
          reorder_level: 20,
          created_at: '2025-01-01T00:00:00.000Z',
          updated_at: '2025-01-01T00:00:00.000Z',
          deleted_at: null,
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
    @Body() createProductDto: CreateProductDto,
  ): Promise<SuccessResponse<ProductResponseDto>> {
    const product = await this.productService.create(createProductDto);
    return ApiResponseHelper.success(product, 'Product created successfully');
  }

  @HttpCode(HttpStatus.OK)
  @Put(':id')
  @ApiOperation({ summary: 'Update a product by ID' })
  @ApiBody({
    type: UpdateProductDto,
    examples: {
      example1: {
        summary: 'Sample product update payload',
        value: {
          name: 'Updated Laptop',
          description: 'Updated high-performance laptop',
          price: 1099.99,
          cost_price: 850.0,
          sku: 'LAP-001-UPD',
          barcode: '1234567890124',
          category_id: 2,
          supplier_id: 2,
          min_stock_level: 15,
          max_stock_level: 120,
          reorder_level: 25,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Product updated successfully',
        data: {
          id: 1,
          name: 'Updated Laptop',
          description: 'Updated high-performance laptop',
          price: 1099.99,
          cost_price: 850.0,
          sku: 'LAP-001-UPD',
          barcode: '1234567890124',
          category_id: 2,
          supplier_id: 2,
          min_stock_level: 15,
          max_stock_level: 120,
          reorder_level: 25,
          created_at: '2025-01-01T00:00:00.000Z',
          updated_at: '2025-01-02T00:00:00.000Z',
          deleted_at: null,
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
    status: 404,
    description: 'Product not found',
    schema: {
      example: {
        success: false,
        message: 'Product not found',
        data: null,
      },
    },
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<SuccessResponse<ProductResponseDto>> {
    const product = await this.productService.update(id, updateProductDto);
    return ApiResponseHelper.success(product, 'Product updated successfully');
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product by ID' })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Product deleted successfully',
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
    status: 404,
    description: 'Product not found',
    schema: {
      example: {
        success: false,
        message: 'Product not found',
        data: null,
      },
    },
  })
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<null>> {
    await this.productService.delete(id);
    return ApiResponseHelper.success(null, 'Product deleted successfully');
  }
}
