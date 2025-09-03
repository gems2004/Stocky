export interface TopProductsRawResult {
  product_id: number;
  product_name: string;
  quantity_sold: string;
  total_revenue: string;
}

export interface ProfitMarginRawResult {
  product_id: number;
  product_name: string;
  product_cost: string;
  product_price: string;
  quantity_sold: string;
  total_revenue: string;
}
