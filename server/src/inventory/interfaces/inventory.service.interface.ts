import { AdjustInventoryDto } from '../dto/adjust-inventory.dto';
import { InventoryLogResponseDto } from '../dto/inventory-log-response.dto';

export interface IInventoryService {
  adjustInventory(
    adjustInventoryDto: AdjustInventoryDto,
    userId?: number,
  ): Promise<InventoryLogResponseDto>;
  getInventoryLogs(): Promise<InventoryLogResponseDto[]>;
  getInventoryLogsWithPagination(
    page: number,
    limit: number,
  ): Promise<{ data: InventoryLogResponseDto[]; total: number; page: number; limit: number }>;
}
