export class WeeklySaleDto {
  day: string;
  sale: number;
}

export class WeeklySalesResponseDto {
  data: WeeklySaleDto[];
  date_range: {
    start: Date;
    end: Date;
  };
}