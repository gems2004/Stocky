export class ProfitMarginDto {
  product_id: number;
  product_name: string;
  cost: number;
  price: number;
  profit: number;
  profit_margin_percentage: number;
  quantity_sold: number;
  total_profit: number;
}

export class ProfitMarginResponseDto {
  products: ProfitMarginDto[];
  overall_profit_margin_percentage: number;
  date_range: {
    start: Date;
    end: Date;
  };
}
