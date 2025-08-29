import { Product } from '../entity/product.entity';

export class ProductResponseDto {
  id: number;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  categoryId?: number;
  supplierId?: number;
  barcode?: string;
  sku?: string;
  stockQuantity: number;
  minStockLevel: number;
  createdAt: Date;
  updatedAt: Date;
}