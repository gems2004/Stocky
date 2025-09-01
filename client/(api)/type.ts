import {
  BusinessType,
  Currency,
  DatabaseType,
} from "@/app/(auth)/setup/schema";

export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}
export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    technicalDetails?: string;
    timestamp: string;
    requestId?: string;
  };
}
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// ==================================
// Stocky Application Types
// Organized by Module
// ==================================

// ----------------------------------
// Auth Module DTOs
// ----------------------------------

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

// ----------------------------------
// User Module DTOs
// ----------------------------------

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}

export interface UserResponseDto {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchUserDto {
  name?: string;
  email?: string;
  role?: string;
  page?: number;
  limit?: number;
}

// ----------------------------------
// Category Module DTOs
// ----------------------------------

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
}

export interface CategoryResponseDto {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ----------------------------------
// Product Module DTOs
// ----------------------------------

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  supplierId: number;
  stock: number;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: number;
  supplierId?: number;
  stock?: number;
}

export interface ProductResponseDto {
  id: number;
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  supplierId: number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchProductDto {
  name?: string;
  categoryId?: number;
  supplierId?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

// ----------------------------------
// Supplier Module DTOs
// ----------------------------------

export interface CreateSupplierDto {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
}

export interface UpdateSupplierDto {
  name?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface SupplierResponseDto {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

// ----------------------------------
// Transaction Module DTOs
// ----------------------------------

export interface CreateTransactionDto {
  customerId?: number;
  items: Array<{
    productId: number;
    quantity: number;
    price: number;
  }>;
  paymentMethod: string;
  discount?: number;
  tax?: number;
}

export interface UpdateTransactionDto {
  customerId?: number;
  items?: Array<{
    productId: number;
    quantity: number;
    price: number;
  }>;
  paymentMethod?: string;
  discount?: number;
  tax?: number;
}

export interface TransactionResponseDto {
  id: number;
  customerId?: number;
  items: Array<{
    productId: number;
    quantity: number;
    price: number;
  }>;
  paymentMethod: string;
  discount?: number;
  tax?: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchTransactionDto {
  customerId?: number;
  startDate?: Date;
  endDate?: Date;
  paymentMethod?: string;
  page?: number;
  limit?: number;
}

// ----------------------------------
// Setup Module DTOs
// ----------------------------------

export interface AdminUserDto {
  name: string;
  email: string;
  password: string;
}

export interface DatabaseConfigDto {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  type: DatabaseType;
  ssl: boolean;
  tablePrefix?: string;
}

export interface SetupStatusDto {
  isDatabaseConfigured: boolean;
  isShopInfoSet: boolean;
  isAdminUserCreated: boolean;
}

export interface ShopInfoDto {
  name: string;
  address: string;
  phone: string;
  email: string;
  type: BusinessType;
  currency: Currency;
  website?: string;
}
