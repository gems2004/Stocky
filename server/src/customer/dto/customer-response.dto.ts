export class CustomerResponseDto {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  loyalty_points: number;
  created_at: Date;
}