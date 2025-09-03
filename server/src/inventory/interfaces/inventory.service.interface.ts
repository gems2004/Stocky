import { AdjustInventoryDto } from '../dto/adjust-inventory.dto';
import { InventoryLogResponseDto } from '../dto/inventory-log-response.dto';
import { Product } from '../../product/entity/product.entity';

export interface IInventoryService {
  adjustInventory(
    adjustInventoryDto: AdjustInventoryDto,
    userId?: number,
  ): Promise<InventoryLogResponseDto>;
  getInventoryLogs(): Promise<InventoryLogResponseDto[]>;
  getLowStockProducts(threshold?: number): Promise<Product[]>;
}
