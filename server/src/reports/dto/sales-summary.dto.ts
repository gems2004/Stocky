export class SalesSummaryDto {
  total_sales: number;
  total_transactions: number;
  average_transaction_value: number;
  date_range: {
    start: Date;
    end: Date;
  };
}
