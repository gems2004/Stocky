import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { SearchProductDto } from '../dto/search-product.dto';

export interface IProductService {
  findAll(
    page: number,
    limit: number,
    categoryId?: number,
    supplierId?: number,
  ): Promise<{
    data: ProductResponseDto[];
    page: number;
    total: number;
    limit: number;
  }>;
  findOne(id: number): Promise<ProductResponseDto>;
  create(productData: CreateProductDto): Promise<ProductResponseDto>;
  update(
    id: number,
    productData: UpdateProductDto,
  ): Promise<ProductResponseDto>;
  delete(id: number): Promise<void>;
  search(query: SearchProductDto): Promise<{
    data: ProductResponseDto[];
    total: number;
    page: number;
    limit: number;
  }>;
}
