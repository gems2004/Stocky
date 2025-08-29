import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { IProductService } from './interfaces/product.service.interface';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { SearchProductDto } from './dto/search-product.dto';
import { Product } from './entity/product.entity';
import { CustomException } from '../common/exceptions/custom.exception';
import { LoggerService } from '../common/logger.service';

@Injectable()
export class ProductService implements IProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly logger: LoggerService,
  ) {}

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
      this.logger.log(`Fetching products - page: ${page}, limit: ${limit}`);

      // Validate pagination parameters
      if (page < 1) {
        page = 1;
      }
      if (limit < 1 || limit > 100) {
        limit = 10;
      }

      let products: Product[] = [];
      let total: number = 0;

      try {
        [products, total] = await this.productRepository.findAndCount({
          skip: (page - 1) * limit,
          take: limit,
          order: {
            id: 'ASC',
          },
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          'Database query failed during product lookup',
          errorMessage,
        );
        throw new CustomException(
          'Database query failed during product lookup',
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Error querying products: ${errorMessage}`,
        );
      }

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
        supplierId: product.supplier_id,
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
      this.logger.error(
        'An unexpected error occurred while fetching all products',
        errorMessage,
      );
      throw new CustomException(
        'An unexpected error occurred while fetching all products',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in findAll function: ${errorMessage}`,
      );
    }
  }

  async findOne(id: number): Promise<ProductResponseDto> {
    try {
      this.logger.log(`Fetching product with ID: ${id}`);

      // Validate ID parameter
      if (!id || id <= 0) {
        const errorMsg = `Invalid product ID provided: ${id}`;
        this.logger.warn(errorMsg);
        throw new CustomException(
          'Invalid product ID',
          HttpStatus.BAD_REQUEST,
          errorMsg,
        );
      }

      let product: Product | null = null;
      try {
        product = await this.productRepository.findOne({
          where: { id },
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          `Database query failed during product lookup for ID: ${id}`,
          errorMessage,
        );
        throw new CustomException(
          'Database query failed during product lookup',
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Error querying product with ID ${id}: ${errorMessage}`,
        );
      }

      // If product not found, throw exception
      if (!product) {
        const errorMsg = `Product not found with ID: ${id}`;
        this.logger.warn(errorMsg);
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
        supplierId: product.supplier_id,
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
      this.logger.error(
        `An unexpected error occurred while fetching product with ID: ${id}`,
        errorMessage,
      );
      throw new CustomException(
        'An unexpected error occurred while fetching product',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in findOne function: ${errorMessage}`,
      );
    }
  }

  async create(productData: CreateProductDto): Promise<ProductResponseDto> {
    try {
      this.logger.log('Creating a new product');

      // Validate required fields
      if (!productData.name || !productData.price) {
        const errorMsg = 'Product name and price are required';
        this.logger.warn(errorMsg);
        throw new CustomException(
          'Product name and price are required',
          HttpStatus.BAD_REQUEST,
          errorMsg,
        );
      }

      // Validate price is positive
      if (productData.price <= 0) {
        const errorMsg = 'Product price must be positive';
        this.logger.warn(errorMsg);
        throw new CustomException(
          'Product price must be positive',
          HttpStatus.BAD_REQUEST,
          errorMsg,
        );
      }

      // Validate cost if provided
      if (productData.cost && productData.cost <= 0) {
        const errorMsg = 'Product cost must be positive';
        this.logger.warn(errorMsg);
        throw new CustomException(
          'Product cost must be positive',
          HttpStatus.BAD_REQUEST,
          errorMsg,
        );
      }

      // Validate minStockLevel if provided
      if (productData.minStockLevel && productData.minStockLevel < 0) {
        const errorMsg = 'Product minimum stock level cannot be negative';
        this.logger.warn(errorMsg);
        throw new CustomException(
          'Product minimum stock level cannot be negative',
          HttpStatus.BAD_REQUEST,
          errorMsg,
        );
      }

      // Check if product with same barcode or SKU already exists
      if (productData.barcode || productData.sku) {
        try {
          const existingProduct = await this.productRepository.findOne({
            where: [
              { barcode: productData.barcode },
              { sku: productData.sku },
            ].filter((condition) => Object.values(condition)[0] !== undefined), // Only include conditions with defined values
          });

          if (existingProduct) {
            const errorMsg = `Product with this barcode or SKU already exists: ${existingProduct.name}`;
            this.logger.warn(errorMsg);
            throw new CustomException(
              'Product with this barcode or SKU already exists',
              HttpStatus.CONFLICT,
              errorMsg,
            );
          }
        } catch (error: unknown) {
          // Only re-throw if it's not the "not found" case (which is expected)
          if (
            !(error instanceof Error && error.message.includes('not found'))
          ) {
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
              'Database query failed during product existence check',
              errorMessage,
            );
            throw new CustomException(
              'Database query failed during product existence check',
              HttpStatus.INTERNAL_SERVER_ERROR,
              `Error checking product existence: ${errorMessage}`,
            );
          }
        }
      }

      // Create new product entity
      const newProduct = this.productRepository.create({
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
      let savedProduct: Product;
      try {
        savedProduct = await this.productRepository.save(newProduct);
        this.logger.log(
          `Successfully created product with ID: ${savedProduct.id}`,
        );
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error('Failed to save product', errorMessage);
        throw new CustomException(
          'Failed to save product',
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Error saving new product: ${errorMessage}`,
        );
      }

      // Map entity to DTO
      const productResponseDto: ProductResponseDto = {
        id: savedProduct.id,
        name: savedProduct.name,
        description: savedProduct.description,
        price: Number(savedProduct.price),
        cost: savedProduct.cost ? Number(savedProduct.cost) : undefined,
        categoryId: savedProduct.category_id,
        supplierId: savedProduct.supplier_id,
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
      this.logger.error(
        'An unexpected error occurred during product creation',
        errorMessage,
      );
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
      this.logger.log(`Updating product with ID: ${id}`);

      // Validate ID parameter
      if (!id || id <= 0) {
        const errorMsg = `Invalid product ID provided: ${id}`;
        this.logger.warn(errorMsg);
        throw new CustomException(
          'Invalid product ID',
          HttpStatus.BAD_REQUEST,
          errorMsg,
        );
      }

      // Find the existing product
      let existingProduct: Product | null = null;
      try {
        existingProduct = await this.productRepository.findOne({
          where: { id },
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          `Database query failed during product lookup for ID: ${id}`,
          errorMessage,
        );
        throw new CustomException(
          'Database query failed during product lookup',
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Error querying product with ID ${id}: ${errorMessage}`,
        );
      }

      // If product not found, throw exception
      if (!existingProduct) {
        const errorMsg = `Product not found with ID: ${id}`;
        this.logger.warn(errorMsg);
        throw new CustomException(
          'Product not found',
          HttpStatus.NOT_FOUND,
          errorMsg,
        );
      }

      // Validate price if provided
      if (productData.price !== undefined && productData.price <= 0) {
        const errorMsg = 'Product price must be positive';
        this.logger.warn(errorMsg);
        throw new CustomException(
          'Product price must be positive',
          HttpStatus.BAD_REQUEST,
          errorMsg,
        );
      }

      // Validate cost if provided
      if (productData.cost !== undefined && productData.cost <= 0) {
        const errorMsg = 'Product cost must be positive';
        this.logger.warn(errorMsg);
        throw new CustomException(
          'Product cost must be positive',
          HttpStatus.BAD_REQUEST,
          errorMsg,
        );
      }

      // Validate minStockLevel if provided
      if (
        productData.minStockLevel !== undefined &&
        productData.minStockLevel < 0
      ) {
        const errorMsg = 'Product minimum stock level cannot be negative';
        this.logger.warn(errorMsg);
        throw new CustomException(
          'Product minimum stock level cannot be negative',
          HttpStatus.BAD_REQUEST,
          errorMsg,
        );
      }

      // Check if another product with same barcode or SKU already exists
      if (productData.barcode || productData.sku) {
        try {
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
              await this.productRepository.findOne({
                where: whereConditions,
              });

            if (
              existingProductWithBarcodeOrSku &&
              existingProductWithBarcodeOrSku.id !== id
            ) {
              const errorMsg = `Product with this barcode or SKU already exists: ${existingProductWithBarcodeOrSku.name}`;
              this.logger.warn(errorMsg);
              throw new CustomException(
                'Product with this barcode or SKU already exists',
                HttpStatus.CONFLICT,
                errorMsg,
              );
            }
          }
        } catch (error: unknown) {
          // Only re-throw if it's not the "not found" case (which is expected)
          if (
            !(error instanceof Error && error.message.includes('not found'))
          ) {
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(
              'Database query failed during product existence check',
              errorMessage,
            );
            throw new CustomException(
              'Database query failed during product existence check',
              HttpStatus.INTERNAL_SERVER_ERROR,
              `Error checking product existence: ${errorMessage}`,
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
      let updatedProduct: Product;
      try {
        updatedProduct = await this.productRepository.save(existingProduct);
        this.logger.log(
          `Successfully updated product with ID: ${updatedProduct.id}`,
        );
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error('Failed to update product', errorMessage);
        throw new CustomException(
          'Failed to update product',
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Error updating product: ${errorMessage}`,
        );
      }

      // Map entity to DTO
      const productResponseDto: ProductResponseDto = {
        id: updatedProduct.id,
        name: updatedProduct.name,
        description: updatedProduct.description,
        price: Number(updatedProduct.price),
        cost: updatedProduct.cost ? Number(updatedProduct.cost) : undefined,
        categoryId: updatedProduct.category_id,
        supplierId: updatedProduct.supplier_id,
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
      this.logger.error(
        `An unexpected error occurred during product update for ID: ${id}`,
        errorMessage,
      );
      throw new CustomException(
        'An unexpected error occurred during product update',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in update function: ${errorMessage}`,
      );
    }
  }

  async delete(id: number): Promise<void> {
    try {
      this.logger.log(`Deleting product with ID: ${id}`);

      // Validate ID parameter
      if (!id || id <= 0) {
        const errorMsg = `Invalid product ID provided: ${id}`;
        this.logger.warn(errorMsg);
        throw new CustomException(
          'Invalid product ID',
          HttpStatus.BAD_REQUEST,
          errorMsg,
        );
      }

      // Check if product exists
      let existingProduct: Product | null = null;
      try {
        existingProduct = await this.productRepository.findOne({
          where: { id },
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          `Database query failed during product lookup for ID: ${id}`,
          errorMessage,
        );
        throw new CustomException(
          'Database query failed during product lookup',
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Error querying product with ID ${id}: ${errorMessage}`,
        );
      }

      // If product not found, throw exception
      if (!existingProduct) {
        const errorMsg = `Product not found with ID: ${id}`;
        this.logger.warn(errorMsg);
        throw new CustomException(
          'Product not found',
          HttpStatus.NOT_FOUND,
          errorMsg,
        );
      }

      // Delete the product
      try {
        await this.productRepository.delete(id);
        this.logger.log(`Successfully deleted product with ID: ${id}`);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error('Failed to delete product', errorMessage);
        throw new CustomException(
          'Failed to delete product',
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Error deleting product: ${errorMessage}`,
        );
      }
    } catch (error) {
      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `An unexpected error occurred during product deletion for ID: ${id}`,
        errorMessage,
      );
      throw new CustomException(
        'An unexpected error occurred during product deletion',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in delete function: ${errorMessage}`,
      );
    }
  }

  async search(query: SearchProductDto): Promise<ProductResponseDto[]> {
    try {
      this.logger.log(`Searching products with query: ${query.query}`);

      let products: Product[] = [];
      try {
        // Search for products matching the query in name, description, barcode, or SKU
        products = await this.productRepository.find({
          where: [
            { name: Like(`%${query.query}%`) },
            { description: Like(`%${query.query}%`) },
            { barcode: Like(`%${query.query}%`) },
            { sku: Like(`%${query.query}%`) },
          ],
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          'Database query failed during product search',
          errorMessage,
        );
        throw new CustomException(
          'Database query failed during product search',
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Error searching products: ${errorMessage}`,
        );
      }

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
        supplierId: product.supplier_id,
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
      this.logger.error(
        `An unexpected error occurred during product search with query: ${query.query}`,
        errorMessage,
      );
      throw new CustomException(
        'An unexpected error occurred during product search',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in search function: ${errorMessage}`,
      );
    }
  }
}
