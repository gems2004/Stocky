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
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SearchProductDto } from './dto/search-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ApiResponseHelper } from '../common/helpers/api-response.helper';
import { SuccessResponse } from '../common/types/api-response.type';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CustomException } from '../common/exceptions/custom.exception';

@Controller('products')
@UseGuards(AuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @HttpCode(HttpStatus.OK)
  @Get('search')
  async search(
    @Query('query') query: string,
  ): Promise<SuccessResponse<ProductResponseDto[]>> {
    // Validate search query
    if (!query || query.trim().length === 0) {
      throw new CustomException(
        'Search query cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }

    const products = await this.productService.search({ query });
    return ApiResponseHelper.success(
      products,
      'Products search completed successfully',
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<
    SuccessResponse<{
      data: ProductResponseDto[];
      total: number;
      page: number;
      limit: number;
    }>
  > {
    // Parse page and limit with default values
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    // Validate page and limit
    if (isNaN(pageNum) || pageNum < 1) {
      throw new CustomException(
        'Page must be a positive number',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new CustomException(
        'Limit must be a positive number between 1 and 100',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.productService.findAll(pageNum, limitNum);
    return ApiResponseHelper.success(result, 'Products retrieved successfully');
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<SuccessResponse<ProductResponseDto>> {
    // Validate ID parameter
    const productId = parseInt(id, 10);
    if (isNaN(productId) || productId <= 0) {
      throw new CustomException('Invalid product ID', HttpStatus.BAD_REQUEST);
    }

    const product = await this.productService.findOne(productId);
    return ApiResponseHelper.success(product, 'Product retrieved successfully');
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<SuccessResponse<ProductResponseDto>> {
    const product = await this.productService.create(createProductDto);
    return ApiResponseHelper.success(product, 'Product created successfully');
  }

  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<SuccessResponse<ProductResponseDto>> {
    // Validate ID parameter
    const productId = parseInt(id, 10);
    if (isNaN(productId) || productId <= 0) {
      throw new CustomException('Invalid product ID', HttpStatus.BAD_REQUEST);
    }

    const product = await this.productService.update(
      productId,
      updateProductDto,
    );
    return ApiResponseHelper.success(product, 'Product updated successfully');
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<SuccessResponse<null>> {
    // Validate ID parameter
    const productId = parseInt(id, 10);
    if (isNaN(productId) || productId <= 0) {
      throw new CustomException('Invalid product ID', HttpStatus.BAD_REQUEST);
    }

    await this.productService.delete(productId);
    return ApiResponseHelper.success(null, 'Product deleted successfully');
  }
}
