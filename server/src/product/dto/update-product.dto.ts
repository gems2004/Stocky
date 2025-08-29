export class UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  cost?: number;
  categoryId?: number;
  supplierId?: number;
  barcode?: string;
  sku?: string;
  minStockLevel?: number;
  stockQuantity?: number;
}