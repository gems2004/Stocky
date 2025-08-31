import { Product } from '../entity/product.entity';
import { CategoryResponseDto } from '../../category/dto/category-response.dto';
import { SupplierResponseDto } from '../../supplier/dto/supplier-response.dto';

export class ProductResponseDto {
  id: number;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  categoryId?: number;
  category?: CategoryResponseDto;
  supplierId?: number;
  supplier?: SupplierResponseDto;
  barcode?: string;
  sku?: string;
  stockQuantity: number;
  minStockLevel: number;
  createdAt: Date;
  updatedAt: Date;
}
