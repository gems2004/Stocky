export class DashboardStatsDto {
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
}

export class DashboardStatsResponseDto {
  stats: DashboardStatsDto;
  date_range: {
    start: Date;
    end: Date;
  };
}
