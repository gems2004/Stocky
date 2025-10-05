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

@Controller('products')
@UseGuards(AuthGuard, AppReadyGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @HttpCode(HttpStatus.OK)
  @Get('search')
  async search(
    @Query() searchProductDto: SearchProductDto,
  ): Promise<SuccessResponse<{
    data: ProductResponseDto[];
    total: number;
    page: number;
    limit: number;
  }>> {
    const result = await this.productService.search(searchProductDto);
    return ApiResponseHelper.success(
      result,
      'Products search completed successfully',
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get()
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
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<ProductResponseDto>> {
    const product = await this.productService.findOne(id);
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
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<SuccessResponse<ProductResponseDto>> {
    const product = await this.productService.update(id, updateProductDto);
    return ApiResponseHelper.success(product, 'Product updated successfully');
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<null>> {
    await this.productService.delete(id);
    return ApiResponseHelper.success(null, 'Product deleted successfully');
  }
}
