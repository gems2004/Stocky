import { Product } from '../entity/product.entity';
import { CategoryResponseDto } from '../../category/dto/category-response.dto';

export class ProductResponseDto {
  id: number;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  categoryId?: number;
  category?: CategoryResponseDto;
  supplierId?: number;
  barcode?: string;
  sku?: string;
  stockQuantity: number;
  minStockLevel: number;
  createdAt: Date;
  updatedAt: Date;
}
