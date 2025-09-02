# API Types for Frontend Implementation

This document provides detailed information about the API endpoints, data structures, and types that the frontend should use when interacting with the Stocky backend.

## Table of Contents
1. [Authentication](#authentication)
2. [Users](#users)
3. [Products](#products)
4. [Categories](#categories)
5. [Suppliers](#suppliers)
6. [Common Types](#common-types)

## Authentication

### Endpoints

#### POST `/auth/login`
Login to the application.

**Request Body:**
```typescript
interface LoginDto {
  username: string; // Min length: 1
  password: string; // Min length: 6
}
```

**Response:**
```typescript
interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  tokens: AuthTokens;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface JwtPayload {
  sub: number; // User ID
  username: string;
  role: UserRole; // 'ADMIN' | 'CASHIER'
  exp?: number; // Expiration timestamp
  iat?: number; // Issued at timestamp
}
```

#### POST `/auth/refresh`
Refresh authentication tokens.

**Request Body:**
```typescript
interface RefreshTokenDto {
  refreshToken: string;
}
```

**Response:**
```typescript
interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  tokens: AuthTokens;
}
```

#### GET `/auth/profile`
Get authenticated user profile.

**Response:**
```typescript
interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  tokens: AuthTokens;
}
```

## Users

### Endpoints

#### POST `/users`
Create a new user (Public endpoint).

**Request Body:**
```typescript
interface CreateUserDto {
  username: string;
  email?: string; // Optional
  password: string;
  firstName?: string; // Optional
  lastName?: string; // Optional
  role?: UserRole; // Optional, defaults to CASHIER
}
```

**Response:**
```typescript
interface UserResponseDto {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
```

#### GET `/users`
Get all users with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```typescript
interface UsersResponse {
  data: UserResponseDto[];
  total: number;
  page: number;
  limit: number;
}
```

#### GET `/users/:id`
Get a specific user by ID.

**Response:**
```typescript
interface UserResponseDto {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
```

#### PUT `/users/:id`
Update a user.

**Request Body:**
```typescript
interface UpdateUserDto {
  username?: string; // Optional
  email?: string; // Optional
  password?: string; // Optional
  firstName?: string; // Optional
  lastName?: string; // Optional
  role?: UserRole; // Optional
}
```

**Response:**
```typescript
interface UserResponseDto {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
```

#### DELETE `/users/:id`
Delete a user.

**Response:**
```typescript
// Success response with null data
```

#### GET `/users/search`
Search users by query.

**Query Parameters:**
- `query`: Search term

**Response:**
```typescript
UserResponseDto[]
```

## Products

### Endpoints

#### POST `/products`
Create a new product.

**Request Body:**
```typescript
interface CreateProductDto {
  name: string; // Min length: 1
  description?: string; // Optional
  price: number; // Positive number
  cost?: number; // Optional, min: 0
  categoryId?: number; // Optional, min: 1
  supplierId?: number; // Optional, min: 1
  barcode?: string; // Optional
  sku?: string; // Optional
  minStockLevel?: number; // Optional, min: 0
}
```

**Response:**
```typescript
interface ProductResponseDto {
  id: number;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  categoryId?: number;
  category?: CategoryResponseDto;
  supplierId?: number;
  supplier?: SupplierResponseDto;
  barcode?: string;
  sku?: string;
  stockQuantity: number;
  minStockLevel: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### GET `/products`
Get all products with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```typescript
interface ProductsResponse {
  data: ProductResponseDto[];
  total: number;
  page: number;
  limit: number;
}
```

#### GET `/products/:id`
Get a specific product by ID.

**Response:**
```typescript
interface ProductResponseDto {
  id: number;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  categoryId?: number;
  category?: CategoryResponseDto;
  supplierId?: number;
  supplier?: SupplierResponseDto;
  barcode?: string;
  sku?: string;
  stockQuantity: number;
  minStockLevel: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### PUT `/products/:id`
Update a product.

**Request Body:**
```typescript
interface UpdateProductDto {
  name?: string; // Optional, Min length: 1
  description?: string; // Optional
  price?: number; // Optional, Positive number
  cost?: number; // Optional, min: 0
  categoryId?: number; // Optional, min: 1
  supplierId?: number; // Optional, min: 1
  barcode?: string; // Optional
  sku?: string; // Optional
  minStockLevel?: number; // Optional, min: 0
  stockQuantity?: number; // Optional, min: 0
}
```

**Response:**
```typescript
interface ProductResponseDto {
  id: number;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  categoryId?: number;
  category?: CategoryResponseDto;
  supplierId?: number;
  supplier?: SupplierResponseDto;
  barcode?: string;
  sku?: string;
  stockQuantity: number;
  minStockLevel: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### DELETE `/products/:id`
Delete a product.

**Response:**
```typescript
// Success response with null data
```

#### GET `/products/search`
Search products by query.

**Query Parameters:**
- `query`: Search term

**Response:**
```typescript
ProductResponseDto[]
```

## Categories

### Endpoints

#### POST `/category`
Create a new category (Admin only).

**Request Body:**
```typescript
interface CreateCategoryDto {
  name: string; // Min length: 1
  description?: string; // Optional
}
```

**Response:**
```typescript
interface CategoryResponseDto {
  id: number;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}
```

#### GET `/category`
Get all categories.

**Response:**
```typescript
CategoryResponseDto[]
```

#### PUT `/category/:id`
Update a category (Admin only).

**Request Body:**
```typescript
interface UpdateCategoryDto {
  name?: string; // Optional, Min length: 1
  description?: string; // Optional
}
```

**Response:**
```typescript
interface CategoryResponseDto {
  id: number;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}
```

#### DELETE `/category/:id`
Delete a category (Admin only).

**Response:**
```typescript
// Success response with null data
```

## Suppliers

### Endpoints

#### POST `/supplier`
Create a new supplier (Admin only).

**Request Body:**
```typescript
interface CreateSupplierDto {
  name: string;
  contact_person?: string; // Optional
  email?: string; // Optional, must be valid email
  phone?: string; // Optional
  address?: string; // Optional
}
```

**Response:**
```typescript
interface SupplierResponseDto {
  id: number;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: Date;
  updated_at: Date;
}
```

#### GET `/supplier`
Get all suppliers.

**Response:**
```typescript
SupplierResponseDto[]
```

#### PUT `/supplier/:id`
Update a supplier (Admin only).

**Request Body:**
```typescript
interface UpdateSupplierDto {
  name?: string; // Optional
  contact_person?: string; // Optional
  email?: string; // Optional, must be valid email
  phone?: string; // Optional
  address?: string; // Optional
}
```

**Response:**
```typescript
interface SupplierResponseDto {
  id: number;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: Date;
  updated_at: Date;
}
```

#### DELETE `/supplier/:id`
Delete a supplier (Admin only).

**Response:**
```typescript
// Success response with null data
```

## Common Types

### API Response Format

All API responses follow a consistent format:

```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    technicalDetails?: string;
    timestamp: string;
    requestId?: string;
  };
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
```

### User Roles

```typescript
enum UserRole {
  ADMIN = 'ADMIN',
  CASHIER = 'CASHIER'
}
```

### Authentication Requirements

Most endpoints require authentication using a JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

Some endpoints have role restrictions:
- Admin-only: Category and Supplier management
- Authenticated users: Product and User management (with some restrictions)
- Public: Login and User creation