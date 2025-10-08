import { Injectable, HttpStatus, Inject } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { ICategoryService } from './interfaces/category.service.interface';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CustomException } from '../common/exceptions/custom.exception';
import { LoggerService } from '../common/logger.service';
import { DynamicDatabaseService } from '../dynamic-database/dynamic-database.service';
import { Product } from '../product/entity/product.entity';

@Injectable()
export class CategoryService implements ICategoryService {
  constructor(
    private readonly dynamicDatabaseService: DynamicDatabaseService,
    private readonly logger: LoggerService,
  ) {
    // No initialization in constructor
  }

  private async getCategoryRepository(): Promise<Repository<Category>> {
    try {
      // Ensure the database is ready
      await this.ensureDatabaseReady();
      this.dynamicDatabaseService.ensureDataSourceInitialized();
      const dataSource = this.dynamicDatabaseService.getDataSource();
      return dataSource.getRepository(Category);
    } catch (error) {
      this.logger.error(`Failed to get category repository: ${error.message}`);
      throw new CustomException(
        'Database connection error',
        HttpStatus.SERVICE_UNAVAILABLE,
        `Database may not be properly configured: ${error.message}`,
      );
    }
  }

  private async ensureDatabaseReady(): Promise<void> {
    try {
      this.dynamicDatabaseService.ensureDataSourceInitialized();
    } catch (error) {
      // If the datasource is not initialized, try to initialize it
      this.logger.log('Attempting to reinitialize database connection');
      await this.dynamicDatabaseService.initializeIfConfigured();
      this.dynamicDatabaseService.ensureDataSourceInitialized();
    }
  }

  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    try {
      const categoryRepository = await this.getCategoryRepository();
      this.logger.log(
        `Attempting to create category: ${createCategoryDto.name}`,
      );

      // Check if category already exists
      const existingCategory = await categoryRepository.findOne({
        where: { name: createCategoryDto.name },
      });

      if (existingCategory) {
        const errorMsg = `Category with this name already exists: ${createCategoryDto.name}`;
        throw new CustomException(
          'Category with this name already exists',
          HttpStatus.CONFLICT,
          errorMsg,
        );
      }

      // Create new category entity
      const newCategory = categoryRepository.create({
        name: createCategoryDto.name,
        description: createCategoryDto.description,
      });

      // Save the category
      const savedCategory = await categoryRepository.save(newCategory);
      this.logger.log(
        `Successfully created category with ID: ${savedCategory.id}`,
      );

      // Construct response
      const categoryResponse: CategoryResponseDto = {
        id: savedCategory.id,
        name: savedCategory.name,
        description: savedCategory.description,
        created_at: savedCategory.created_at,
        updated_at: savedCategory.updated_at,
        productCount: 0, // New category has 0 products
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
      const categoryRepository = await this.getCategoryRepository();
      const productRepository = this.dynamicDatabaseService
        .getDataSource()
        .getRepository(Product);
      this.logger.log('Fetching all categories');

      // Find all categories
      const categories = await categoryRepository.find({
        order: { name: 'ASC' },
      });

      this.logger.log(`Successfully fetched ${categories.length} categories`);

      // Map to response DTOs with product counts
      const categoryResponses: CategoryResponseDto[] = await Promise.all(
        categories.map(async (category) => {
          // Count products for this category
          const productCount = await productRepository.count({
            where: { category_id: category.id },
          });

          return {
            id: category.id,
            name: category.name,
            description: category.description,
            created_at: category.created_at,
            updated_at: category.updated_at,
            productCount: productCount,
          };
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
      const categoryRepository = await this.getCategoryRepository();
      const productRepository = this.dynamicDatabaseService
        .getDataSource()
        .getRepository(Product);
      this.logger.log(`Attempting to update category ID: ${id}`);

      // Find category by ID
      const category = await categoryRepository.findOne({
        where: { id },
      });

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
        const existingCategory = await categoryRepository.findOne({
          where: { name: updateCategoryDto.name },
        });

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
      const updatedCategory = await categoryRepository.save(category);
      this.logger.log(
        `Successfully updated category with ID: ${updatedCategory.id}`,
      );

      // Count products for this category
      const productCount = await productRepository.count({
        where: { category_id: updatedCategory.id },
      });

      // Construct response
      const categoryResponse: CategoryResponseDto = {
        id: updatedCategory.id,
        name: updatedCategory.name,
        description: updatedCategory.description,
        created_at: updatedCategory.created_at,
        updated_at: updatedCategory.updated_at,
        productCount: productCount,
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
      const categoryRepository = await this.getCategoryRepository();
      this.logger.log(`Attempting to remove category ID: ${id}`);

      // Find category by ID
      const category = await categoryRepository.findOne({
        where: { id },
      });

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
      await categoryRepository.remove(category);
      this.logger.log(`Successfully removed category with ID: ${id}`);
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

  async findOne(id: number): Promise<CategoryResponseDto> {
    try {
      const categoryRepository = await this.getCategoryRepository();
      const productRepository = this.dynamicDatabaseService
        .getDataSource()
        .getRepository(Product);
      this.logger.log(`Fetching category with ID: ${id}`);

      // Find category by ID
      const category = await categoryRepository.findOne({
        where: { id },
      });

      // If category not found, throw exception
      if (!category) {
        const errorMsg = `Category not found with ID: ${id}`;
        throw new CustomException(
          'Category not found',
          HttpStatus.NOT_FOUND,
          errorMsg,
        );
      }

      this.logger.log(`Successfully fetched category with ID: ${id}`);

      // Count products for this category
      const productCount = await productRepository.count({
        where: { category_id: category.id },
      });

      // Construct response
      const categoryResponse: CategoryResponseDto = {
        id: category.id,
        name: category.name,
        description: category.description,
        created_at: category.created_at,
        updated_at: category.updated_at,
        productCount: productCount,
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
        'An unexpected error occurred while fetching category by ID',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in findOne function: ${errorMessage}`,
      );
    }
  }
}
