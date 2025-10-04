import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CategoryResponseDto } from '../dto/category-response.dto';

export interface ICategoryService {
  create(createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto>;
  findAll(): Promise<CategoryResponseDto[]>;
  findOne(id: number): Promise<CategoryResponseDto>;
  update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto>;
  remove(id: number): Promise<void>;
}
