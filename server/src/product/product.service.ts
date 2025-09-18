import { Injectable, HttpStatus, Inject } from '@nestjs/common';
import { Repository, Like, DataSource } from 'typeorm';
import { IProductService } from './interfaces/product.service.interface';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { SearchProductDto } from './dto/search-product.dto';
import { Product } from './entity/product.entity';
import { CustomException } from '../common/exceptions/custom.exception';
import { LoggerService } from '../common/logger.service';
import { SupplierResponseDto } from '../supplier/dto/supplier-response.dto';
import { DynamicDatabaseService } from '../dynamic-database/dynamic-database.service';

@Injectable()
export class ProductService implements IProductService {
  constructor(
    private readonly dynamicDatabaseService: DynamicDatabaseService,
    private readonly logger: LoggerService,
  ) {
    // No initialization in constructor
  }

  private async getProductRepository(): Promise<Repository<Product>> {
    try {
      // Ensure the database is ready
      await this.ensureDatabaseReady();
      this.dynamicDatabaseService.ensureDataSourceInitialized();
      const dataSource = this.dynamicDatabaseService.getDataSource();
      return dataSource.getRepository(Product);
    } catch (error) {
      this.logger.error(`Failed to get product repository: ${error.message}`);
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

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: ProductResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const productRepository = await this.getProductRepository();
      this.logger.log(`Fetching products - page: ${page}, limit: ${limit}`);

      let products: Product[] = [];
      let total: number = 0;

      [products, total] = await productRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        order: {
          id: 'ASC',
        },
        relations: ['category', 'supplier'], // Load the category and supplier relations
      });

      this.logger.log(
        `Successfully fetched ${products.length} products (page: ${page}, limit: ${limit})`,
      );

      // Map entities to DTOs
      const productResponseDtos = products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        cost: product.cost ? Number(product.cost) : undefined,
        categoryId: product.category_id,
        category: product.category
          ? {
              id: product.category.id,
              name: product.category.name,
              description: product.category.description,
              created_at: product.category.created_at,
              updated_at: product.category.updated_at,
            }
          : undefined,
        supplierId: product.supplier_id,
        supplier: product.supplier
          ? {
              id: product.supplier.id,
              name: product.supplier.name,
              contact_person: product.supplier.contact_person,
              email: product.supplier.email,
              phone: product.supplier.phone,
              address: product.supplier.address,
              created_at: product.supplier.created_at,
              updated_at: product.supplier.updated_at,
            }
          : undefined,
        barcode: product.barcode,
        sku: product.sku,
        stockQuantity: product.stock_quantity,
        minStockLevel: product.min_stock_level,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
      }));

      return {
        data: productResponseDtos,
        total,
        page,
        limit,
      };
    } catch (error) {
      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred while fetching all products',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in findAll function: ${errorMessage}`,
      );
    }
  }

  async findOne(id: number): Promise<ProductResponseDto> {
    try {
      const productRepository = await this.getProductRepository();
      this.logger.log(`Fetching product with ID: ${id}`);

      const product = await productRepository.findOne({
        where: { id },
        relations: ['category', 'supplier'], // Load the category and supplier relations
      });

      // If product not found, throw exception
      if (!product) {
        const errorMsg = `Product not found with ID: ${id}`;
        throw new CustomException(
          'Product not found',
          HttpStatus.NOT_FOUND,
          errorMsg,
        );
      }

      this.logger.log(`Successfully fetched product with ID: ${id}`);

      // Map entity to DTO
      const productResponseDto: ProductResponseDto = {
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        cost: product.cost ? Number(product.cost) : undefined,
        categoryId: product.category_id,
        category: product.category
          ? {
              id: product.category.id,
              name: product.category.name,
              description: product.category.description,
              created_at: product.category.created_at,
              updated_at: product.category.updated_at,
            }
          : undefined,
        supplierId: product.supplier_id,
        supplier: product.supplier
          ? {
              id: product.supplier.id,
              name: product.supplier.name,
              contact_person: product.supplier.contact_person,
              email: product.supplier.email,
              phone: product.supplier.phone,
              address: product.supplier.address,
              created_at: product.supplier.created_at,
              updated_at: product.supplier.updated_at,
            }
          : undefined,
        barcode: product.barcode,
        sku: product.sku,
        stockQuantity: product.stock_quantity,
        minStockLevel: product.min_stock_level,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
      };

      return productResponseDto;
    } catch (error) {
      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred while fetching product',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in findOne function: ${errorMessage}`,
      );
    }
  }

  async create(productData: CreateProductDto): Promise<ProductResponseDto> {
    try {
      const productRepository = await this.getProductRepository();
      this.logger.log('Creating a new product');

      // Check if product with same barcode or SKU already exists
      if (productData.barcode || productData.sku) {
        const existingProduct = await productRepository.findOne({
          where: [
            { barcode: productData.barcode },
            { sku: productData.sku },
          ].filter((condition) => Object.values(condition)[0] !== undefined), // Only include conditions with defined values
        });

        if (existingProduct) {
          const errorMsg = `Product with this barcode or SKU already exists: ${existingProduct.name}`;
          throw new CustomException(
            'Product with this barcode or SKU already exists',
            HttpStatus.CONFLICT,
            errorMsg,
          );
        }
      }

      // Create new product entity
      const newProduct = productRepository.create({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        cost: productData.cost,
        category_id: productData.categoryId,
        supplier_id: productData.supplierId,
        barcode: productData.barcode,
        sku: productData.sku,
        min_stock_level: productData.minStockLevel || 0,
        stock_quantity: 0, // Default to 0 for new products
      });

      // Save the product
      const savedProduct = await productRepository.save(newProduct);
      this.logger.log(
        `Successfully created product with ID: ${savedProduct.id}`,
      );

      // Map entity to DTO
      const productResponseDto: ProductResponseDto = {
        id: savedProduct.id,
        name: savedProduct.name,
        description: savedProduct.description,
        price: Number(savedProduct.price),
        cost: savedProduct.cost ? Number(savedProduct.cost) : undefined,
        categoryId: savedProduct.category_id,
        supplierId: savedProduct.supplier_id,
        supplier: savedProduct.supplier
          ? {
              id: savedProduct.supplier.id,
              name: savedProduct.supplier.name,
              contact_person: savedProduct.supplier.contact_person,
              email: savedProduct.supplier.email,
              phone: savedProduct.supplier.phone,
              address: savedProduct.supplier.address,
              created_at: savedProduct.supplier.created_at,
              updated_at: savedProduct.supplier.updated_at,
            }
          : undefined,
        barcode: savedProduct.barcode,
        sku: savedProduct.sku,
        stockQuantity: savedProduct.stock_quantity,
        minStockLevel: savedProduct.min_stock_level,
        createdAt: savedProduct.created_at,
        updatedAt: savedProduct.updated_at,
      };

      return productResponseDto;
    } catch (error) {
      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred during product creation',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in create function: ${errorMessage}`,
      );
    }
  }

  async update(
    id: number,
    productData: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    try {
      const productRepository = await this.getProductRepository();
      this.logger.log(`Updating product with ID: ${id}`);

      // Find the existing product
      const existingProduct = await productRepository.findOne({
        where: { id },
      });

      // If product not found, throw exception
      if (!existingProduct) {
        const errorMsg = `Product not found with ID: ${id}`;
        throw new CustomException(
          'Product not found',
          HttpStatus.NOT_FOUND,
          errorMsg,
        );
      }

      // Check if another product with same barcode or SKU already exists
      if (productData.barcode || productData.sku) {
        const whereConditions: Array<{ barcode: string } | { sku: string }> =
          [];
        if (productData.barcode) {
          whereConditions.push({ barcode: productData.barcode });
        }
        if (productData.sku) {
          whereConditions.push({ sku: productData.sku });
        }

        if (whereConditions.length > 0) {
          const existingProductWithBarcodeOrSku =
            await productRepository.findOne({
              where: whereConditions,
            });

          if (
            existingProductWithBarcodeOrSku &&
            existingProductWithBarcodeOrSku.id !== id
          ) {
            const errorMsg = `Product with this barcode or SKU already exists: ${existingProductWithBarcodeOrSku.name}`;
            throw new CustomException(
              'Product with this barcode or SKU already exists',
              HttpStatus.CONFLICT,
              errorMsg,
            );
          }
        }
      }

      // Update the product entity
      Object.assign(existingProduct, {
        name: productData.name ?? existingProduct.name,
        description: productData.description ?? existingProduct.description,
        price: productData.price ?? existingProduct.price,
        cost: productData.cost ?? existingProduct.cost,
        category_id: productData.categoryId ?? existingProduct.category_id,
        supplier_id: productData.supplierId ?? existingProduct.supplier_id,
        barcode: productData.barcode ?? existingProduct.barcode,
        sku: productData.sku ?? existingProduct.sku,
        min_stock_level:
          productData.minStockLevel ?? existingProduct.min_stock_level,
        stock_quantity:
          productData.stockQuantity ?? existingProduct.stock_quantity,
      });

      // Save the updated product
      const updatedProduct = await productRepository.save(existingProduct);
      this.logger.log(
        `Successfully updated product with ID: ${updatedProduct.id}`,
      );

      // Map entity to DTO
      const productResponseDto: ProductResponseDto = {
        id: updatedProduct.id,
        name: updatedProduct.name,
        description: updatedProduct.description,
        price: Number(updatedProduct.price),
        cost: updatedProduct.cost ? Number(updatedProduct.cost) : undefined,
        categoryId: updatedProduct.category_id,
        supplierId: updatedProduct.supplier_id,
        supplier: updatedProduct.supplier
          ? {
              id: updatedProduct.supplier.id,
              name: updatedProduct.supplier.name,
              contact_person: updatedProduct.supplier.contact_person,
              email: updatedProduct.supplier.email,
              phone: updatedProduct.supplier.phone,
              address: updatedProduct.supplier.address,
              created_at: updatedProduct.supplier.created_at,
              updated_at: updatedProduct.supplier.updated_at,
            }
          : undefined,
        barcode: updatedProduct.barcode,
        sku: updatedProduct.sku,
        stockQuantity: updatedProduct.stock_quantity,
        minStockLevel: updatedProduct.min_stock_level,
        createdAt: updatedProduct.created_at,
        updatedAt: updatedProduct.updated_at,
      };

      return productResponseDto;
    } catch (error) {
      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred during product update',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in update function: ${errorMessage}`,
      );
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const productRepository = await this.getProductRepository();
      this.logger.log(`Deleting product with ID: ${id}`);

      // Check if product exists
      const existingProduct = await productRepository.findOne({
        where: { id },
      });

      // If product not found, throw exception
      if (!existingProduct) {
        const errorMsg = `Product not found with ID: ${id}`;
        throw new CustomException(
          'Product not found',
          HttpStatus.NOT_FOUND,
          errorMsg,
        );
      }

      // Delete the product
      await productRepository.delete(id);
      this.logger.log(`Successfully deleted product with ID: ${id}`);
    } catch (error) {
      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred during product deletion',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in delete function: ${errorMessage}`,
      );
    }
  }

  async search(query: SearchProductDto): Promise<ProductResponseDto[]> {
    try {
      const productRepository = await this.getProductRepository();
      this.logger.log(`Searching products with query: ${query.query}`);

      // Search for products matching the query in name, description, barcode, or SKU
      const products = await productRepository.find({
        where: [
          { name: Like(`%${query.query}%`) },
          { description: Like(`%${query.query}%`) },
          { barcode: Like(`%${query.query}%`) },
          { sku: Like(`%${query.query}%`) },
        ],
        relations: ['category', 'supplier'], // Load the category and supplier relations
      });

      this.logger.log(
        `Found ${products.length} products matching query: ${query.query}`,
      );

      // Map entities to DTOs
      const productResponseDtos = products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        cost: product.cost ? Number(product.cost) : undefined,
        categoryId: product.category_id,
        category: product.category
          ? {
              id: product.category.id,
              name: product.category.name,
              description: product.category.description,
              created_at: product.category.created_at,
              updated_at: product.category.updated_at,
            }
          : undefined,
        supplierId: product.supplier_id,
        supplier: product.supplier
          ? {
              id: product.supplier.id,
              name: product.supplier.name,
              contact_person: product.supplier.contact_person,
              email: product.supplier.email,
              phone: product.supplier.phone,
              address: product.supplier.address,
              created_at: product.supplier.created_at,
              updated_at: product.supplier.updated_at,
            }
          : undefined,
        barcode: product.barcode,
        sku: product.sku,
        stockQuantity: product.stock_quantity,
        minStockLevel: product.min_stock_level,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
      }));

      return productResponseDtos;
    } catch (error) {
      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred during product search',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in search function: ${errorMessage}`,
      );
    }
  }
}
