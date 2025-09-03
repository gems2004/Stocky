export class TopProductDto {
  product_id: number;
  product_name: string;
  quantity_sold: number;
  total_revenue: number;
  rank: number;
}

export class TopProductsResponseDto {
  products: TopProductDto[];
  date_range: {
    start: Date;
    end: Date;
  };
}
