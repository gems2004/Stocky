import { Category } from '../entities/category.entity';

export class CategoryResponseDto {
  id: number;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}