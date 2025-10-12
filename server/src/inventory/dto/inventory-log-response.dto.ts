export class InventoryLogResponseDto {
  id: number;
  product_id: number;
  change_amount: number;
  reason: string;
  user_id: number;
  created_at: Date;
  product_name?: string; // Add product name to the response
}
