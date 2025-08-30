import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICategoryService } from './interfaces/category.service.interface';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CustomException } from '../common/exceptions/custom.exception';
import { LoggerService } from '../common/logger.service';

@Injectable()
export class CategoryService implements ICategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly logger: LoggerService,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    try {
      this.logger.log(
        `Attempting to create category: ${createCategoryDto.name}`,
      );

      // Check if category already exists
      let existingCategory: Category | null = null;
      try {
        existingCategory = await this.categoryRepository.findOne({
          where: { name: createCategoryDto.name },
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        throw new CustomException(
          'Database query failed during category existence check',
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Error querying category existence: ${errorMessage}`,
        );
      }

      if (existingCategory) {
        const errorMsg = `Category with this name already exists: ${createCategoryDto.name}`;
        throw new CustomException(
          'Category with this name already exists',
          HttpStatus.CONFLICT,
          errorMsg,
        );
      }

      // Create new category entity
      const newCategory = this.categoryRepository.create({
        name: createCategoryDto.name,
        description: createCategoryDto.description,
      });

      // Save the category
      let savedCategory: Category;
      try {
        savedCategory = await this.categoryRepository.save(newCategory);
        this.logger.log(
          `Successfully created category with ID: ${savedCategory.id}`,
        );
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        throw new CustomException(
          'Failed to save category',
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Error saving new category: ${errorMessage}`,
        );
      }

      // Construct response
      const categoryResponse: CategoryResponseDto = {
        id: savedCategory.id,
        name: savedCategory.name,
        description: savedCategory.description,
        created_at: savedCategory.created_at,
        updated_at: savedCategory.updated_at,
      };

      return categoryResponse;
    } catch (error) {
      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred during category creation',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in create function: ${errorMessage}`,
      );
    }
  }

  async findAll(): Promise<CategoryResponseDto[]> {
    try {
      this.logger.log('Fetching all categories');

      // Find all categories
      let categories: Category[] = [];
      try {
        categories = await this.categoryRepository.find({
          order: { name: 'ASC' },
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        throw new CustomException(
          'Database query failed during categories lookup',
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Error querying categories: ${errorMessage}`,
        );
      }

      this.logger.log(`Successfully fetched ${categories.length} categories`);

      // Map to response DTOs
      const categoryResponses: CategoryResponseDto[] = categories.map(
        (category) => ({
          id: category.id,
          name: category.name,
          description: category.description,
          created_at: category.created_at,
          updated_at: category.updated_at,
        }),
      );

      return categoryResponses;
    } catch (error) {
      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred while fetching all categories',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in findAll function: ${errorMessage}`,
      );
    }
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    try {
      this.logger.log(`Attempting to update category ID: ${id}`);

      // Find category by ID
      let category: Category | null = null;
      try {
        category = await this.categoryRepository.findOne({
          where: { id },
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        throw new CustomException(
          'Database query failed during category lookup',
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Error querying category: ${errorMessage}`,
        );
      }

      // If category not found, throw exception
      if (!category) {
        const errorMsg = `Category not found with ID: ${id}`;
        throw new CustomException(
          'Category not found',
          HttpStatus.NOT_FOUND,
          errorMsg,
        );
      }

      // Check if name is being updated and if it already exists
      if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
        let existingCategory: Category | null = null;
        try {
          existingCategory = await this.categoryRepository.findOne({
            where: { name: updateCategoryDto.name },
          });
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          throw new CustomException(
            'Database query failed during category existence check',
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Error querying category existence: ${errorMessage}`,
          );
        }

        if (existingCategory) {
          const errorMsg = `Category with this name already exists: ${updateCategoryDto.name}`;
          throw new CustomException(
            'Category with this name already exists',
            HttpStatus.CONFLICT,
            errorMsg,
          );
        }
      }

      // Update category properties
      if (updateCategoryDto.name !== undefined) {
        category.name = updateCategoryDto.name;
      }
      if (updateCategoryDto.description !== undefined) {
        category.description = updateCategoryDto.description;
      }

      // Save the updated category
      let updatedCategory: Category;
      try {
        updatedCategory = await this.categoryRepository.save(category);
        this.logger.log(
          `Successfully updated category with ID: ${updatedCategory.id}`,
        );
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        throw new CustomException(
          'Failed to update category',
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Error updating category: ${errorMessage}`,
        );
      }

      // Construct response
      const categoryResponse: CategoryResponseDto = {
        id: updatedCategory.id,
        name: updatedCategory.name,
        description: updatedCategory.description,
        created_at: updatedCategory.created_at,
        updated_at: updatedCategory.updated_at,
      };

      return categoryResponse;
    } catch (error) {
      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred during category update',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in update function: ${errorMessage}`,
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      this.logger.log(`Attempting to remove category ID: ${id}`);

      // Find category by ID
      let category: Category | null = null;
      try {
        category = await this.categoryRepository.findOne({
          where: { id },
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        throw new CustomException(
          'Database query failed during category lookup',
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Error querying category: ${errorMessage}`,
        );
      }

      // If category not found, throw exception
      if (!category) {
        const errorMsg = `Category not found with ID: ${id}`;
        throw new CustomException(
          'Category not found',
          HttpStatus.NOT_FOUND,
          errorMsg,
        );
      }

      // Remove the category
      try {
        await this.categoryRepository.remove(category);
        this.logger.log(`Successfully removed category with ID: ${id}`);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        throw new CustomException(
          'Failed to remove category',
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Error removing category: ${errorMessage}`,
        );
      }
    } catch (error) {
      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred during category removal',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in remove function: ${errorMessage}`,
      );
    }
  }
}
