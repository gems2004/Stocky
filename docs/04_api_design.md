 # API Design

## Base URL
`http://localhost:3000/api`

## Authentication
All API requests (except login/register) require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Unified Response Format
All API responses follow a consistent format to simplify client-side handling:

### Success Responses
```json
{
  "success": true,
  "data": {},
  "message": "Optional success message"
}
```

### Error Responses
```json
{
  "success": false,
  "error": {
    "message": "User-friendly error message for UI display",
    "code": "ERROR_CODE",
    "technicalDetails": "Detailed technical information for logging/debugging",
    "validationErrors": ["Array of detailed validation error messages (for validation errors only)"],
    "timestamp": "2023-08-26T10:30:00Z",
    "requestId": "unique-request-identifier"
  }
}
```

### Examples

#### Successful Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Product Name",
    "price": 29.99
  },
  "message": "Product retrieved successfully"
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Unable to process your request at the moment. Please try again later.",
    "code": "DATABASE_ERROR",
    "technicalDetails": "Database connection failed: Connection timeout occurred after 30 seconds while trying to connect to host 'db.example.com' on port 5432",
    "timestamp": "2023-08-26T10:30:00Z",
    "requestId": "req_1234567890"
  }
}
```

#### Validation Error Response
```json
{
  "success": false,
  "error": {
    "message": "Bad Request Exception",
    "code": "VALIDATION_ERROR",
    "validationErrors": [
      "username must be a string",
      "password must be longer than or equal to 6 characters"
    ],
    "timestamp": "2023-08-26T10:30:00Z",
    "requestId": "req_1234567890"
  }
}
```

## Endpoints

### Initial Setup

#### Get Setup Status
- **Endpoint**: `GET /setup/status`
- **Description**: Check if system is already set up
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "isDatabaseConfigured": true,
    "isShopConfigured": true,
    "isAdminCreated": true,
    "isSetupComplete": true
  },
  "message": "Setup status retrieved successfully"
}
```

#### Configure Database
- **Endpoint**: `POST /setup/database`
- **Description**: Configure database connection
- **Request Body**:
```json
{
  "type": "postgres",
  "host": "localhost",
  "port": "5432",
  "username": "admin",
  "password": "password",
  "database": "stocky",
  "ssl": false,
  "tablePrefix": "stocky_" // Optional
}
```
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "isDatabaseConfigured": true,
    "isShopConfigured": false,
    "isAdminCreated": false,
    "isSetupComplete": false
  },
  "message": "Database configured successfully"
}
```

#### Configure Shop Information
- **Endpoint**: `POST /setup/shop`
- **Description**: Configure shop information
- **Request Body**:
```json
{
  "name": "My Shop",
  "address": "123 Main St",
  "phone": "+1234567890",
  "email": "shop@example.com"
}
```
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "isDatabaseConfigured": true,
    "isShopConfigured": true,
    "isAdminCreated": false,
    "isSetupComplete": false
  },
  "message": "Shop information configured successfully"
}
```

#### Create Administrator Account
- **Endpoint**: `POST /setup/admin`
- **Description**: Create administrator account
- **Request Body**:
```json
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "securepassword",
  "firstName": "Admin",
  "lastName": "User"
}
```
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "isDatabaseConfigured": true,
    "isShopConfigured": true,
    "isAdminCreated": true,
    "isSetupComplete": false
  },
  "message": "Admin user created successfully"
}
```

#### Complete Setup
- **Endpoint**: `POST /setup/complete`
- **Description**: Finalize setup process
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "isDatabaseConfigured": true,
    "isShopConfigured": true,
    "isAdminCreated": true,
    "isSetupComplete": true
  },
  "message": "Setup process completed successfully"
}
```

### Authentication

#### User Login
- **Endpoint**: `POST /auth/login`
- **Description**: Authenticate user and get tokens
- **Request Body**:
```json
{
  "username": "john_doe",
  "password": "securepassword"
}
```
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "CASHIER",
      "created_at": "2023-08-26T10:30:00Z",
      "updated_at": "2023-08-26T10:30:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
    }
  },
  "message": "Login successful"
}
```

#### Refresh Access Token
- **Endpoint**: `POST /auth/refresh`
- **Description**: Refresh access token using refresh token
- **Request Body**:
```json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
}
```
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "CASHIER",
      "created_at": "2023-08-26T10:30:00Z",
      "updated_at": "2023-08-26T10:30:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "bmV3IHJlZnJlc2ggdG9rZW4..."
    }
  },
  "message": "Token refreshed successfully"
}
```

#### Get User Profile
- **Endpoint**: `GET /auth/profile`
- **Description**: Get current user profile
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "CASHIER",
      "created_at": "2023-08-26T10:30:00Z",
      "updated_at": "2023-08-26T10:30:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
    }
  },
  "message": "Profile retrieved successfully"
}
```

### Products

#### Get All Products
- **Endpoint**: `GET /products?page=1&limit=10`
- **Description**: Get all products with pagination
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10, max: 100)
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "name": "Product 1",
        "description": "Product description",
        "price": 29.99,
        "cost": 15.00,
        "categoryId": 1,
        "category": {
          "id": 1,
          "name": "Electronics",
          "description": "Electronic products",
          "created_at": "2023-08-26T10:30:00Z",
          "updated_at": "2023-08-26T10:30:00Z"
        },
        "supplierId": 1,
        "supplier": {
          "id": 1,
          "name": "Test Supplier",
          "contact_person": "John Supplier",
          "email": "supplier@example.com",
          "phone": "123-456-7890",
          "address": "123 Supplier St, City, Country",
          "created_at": "2023-08-26T10:30:00Z",
          "updated_at": "2023-08-26T10:30:00Z"
        },
        "barcode": "1234567890123",
        "sku": "PROD-001",
        "stockQuantity": 100,
        "minStockLevel": 10,
        "createdAt": "2023-08-26T10:30:00Z",
        "updatedAt": "2023-08-26T10:30:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  },
  "message": "Products retrieved successfully"
}
```

#### Get Specific Product
- **Endpoint**: `GET /products/:id`
- **Description**: Get a specific product by ID
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Product 1",
    "description": "Product description",
    "price": 29.99,
    "cost": 15.00,
    "categoryId": 1,
    "category": {
      "id": 1,
      "name": "Electronics",
      "description": "Electronic products",
      "created_at": "2023-08-26T10:30:00Z",
      "updated_at": "2023-08-26T10:30:00Z"
    },
    "supplierId": 1,
    "supplier": {
      "id": 1,
      "name": "Test Supplier",
      "contact_person": "John Supplier",
      "email": "supplier@example.com",
      "phone": "123-456-7890",
      "address": "123 Supplier St, City, Country",
      "created_at": "2023-08-26T10:30:00Z",
      "updated_at": "2023-08-26T10:30:00Z"
    },
    "barcode": "1234567890123",
    "sku": "PROD-001",
    "stockQuantity": 100,
    "minStockLevel": 10,
    "createdAt": "2023-08-26T10:30:00Z",
    "updatedAt": "2023-08-26T10:30:00Z"
  },
  "message": "Product retrieved successfully"
}
```

#### Create New Product
- **Endpoint**: `POST /products`
- **Description**: Create a new product
- **Request Body**:
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 29.99,
  "cost": 15.00,
  "categoryId": 1,
  "supplierId": 1,
  "barcode": "1234567890124",
  "sku": "PROD-002",
  "minStockLevel": 10
}
```
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "New Product",
    "description": "Product description",
    "price": 29.99,
    "cost": 15.00,
    "categoryId": 1,
    "category": {
      "id": 1,
      "name": "Electronics",
      "description": "Electronic products",
      "created_at": "2023-08-26T10:30:00Z",
      "updated_at": "2023-08-26T10:30:00Z"
    },
    "supplierId": 1,
    "supplier": {
      "id": 1,
      "name": "Test Supplier",
      "contact_person": "John Supplier",
      "email": "supplier@example.com",
      "phone": "123-456-7890",
      "address": "123 Supplier St, City, Country",
      "created_at": "2023-08-26T10:30:00Z",
      "updated_at": "2023-08-26T10:30:00Z"
    },
    "barcode": "1234567890124",
    "sku": "PROD-002",
    "stockQuantity": 0,
    "minStockLevel": 10,
    "createdAt": "2023-08-26T10:30:00Z",
    "updatedAt": "2023-08-26T10:30:00Z"
  },
  "message": "Product created successfully"
}
```

#### Update Product
- **Endpoint**: `PUT /products/:id`
- **Description**: Update an existing product
- **Request Body**:
```json
{
  "name": "Updated Product",
  "description": "Updated description",
  "price": 39.99,
  "cost": 20.00,
  "categoryId": 2,
  "supplierId": 2,
  "barcode": "1234567890125",
  "sku": "PROD-003",
  "minStockLevel": 15
}
```
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Updated Product",
    "description": "Updated description",
    "price": 39.99,
    "cost": 20.00,
    "categoryId": 2,
    "category": {
      "id": 2,
      "name": "Clothing",
      "description": "Clothing products",
      "created_at": "2023-08-26T10:30:00Z",
      "updated_at": "2023-08-26T11:30:00Z"
    },
    "supplierId": 2,
    "supplier": {
      "id": 2,
      "name": "Test Supplier 2",
      "contact_person": "Jane Supplier",
      "email": "supplier2@example.com",
      "phone": "098-765-4321",
      "address": "456 Supplier Ave, City, Country",
      "created_at": "2023-08-26T10:30:00Z",
      "updated_at": "2023-08-26T11:30:00Z"
    },
    "barcode": "1234567890125",
    "sku": "PROD-003",
    "stockQuantity": 0,
    "minStockLevel": 15,
    "createdAt": "2023-08-26T10:30:00Z",
    "updatedAt": "2023-08-26T11:30:00Z"
  },
  "message": "Product updated successfully"
}
```

#### Delete Product
- **Endpoint**: `DELETE /products/:id`
- **Description**: Delete a product
- **Response Example**:
```json
{
  "success": true,
  "data": null,
  "message": "Product deleted successfully"
}
```

#### Search Products
- **Endpoint**: `GET /products/search?query=searchterm`
- **Description**: Search products by name, description, barcode, or SKU
- **Query Parameters**:
  - `query`: Search term
- **Response Example**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Product 1",
      "description": "Product description",
      "price": 29.99,
      "cost": 15.00,
      "categoryId": 1,
      "category": {
        "id": 1,
        "name": "Electronics",
        "description": "Electronic products",
        "created_at": "2023-08-26T10:30:00Z",
        "updated_at": "2023-08-26T10:30:00Z"
      },
      "supplierId": 1,
      "supplier": {
        "id": 1,
        "name": "Test Supplier",
        "contact_person": "John Supplier",
        "email": "supplier@example.com",
        "phone": "123-456-7890",
        "address": "123 Supplier St, City, Country",
        "created_at": "2023-08-26T10:30:00Z",
        "updated_at": "2023-08-26T10:30:00Z"
      },
      "barcode": "1234567890123",
      "sku": "PROD-001",
      "stockQuantity": 100,
      "minStockLevel": 10,
      "createdAt": "2023-08-26T10:30:00Z",
      "updatedAt": "2023-08-26T10:30:00Z"
    }
  ],
  "message": "Products search completed successfully"
}
```

### Categories

#### Get All Categories
- **Endpoint**: `GET /category`
- **Description**: Get all categories
- **Response Example**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Electronics",
      "description": "Electronic products",
      "created_at": "2023-08-26T10:30:00Z",
      "updated_at": "2023-08-26T10:30:00Z"
    },
    {
      "id": 2,
      "name": "Clothing",
      "description": "Clothing products",
      "created_at": "2023-08-26T10:30:00Z",
      "updated_at": "2023-08-26T10:30:00Z"
    }
  ],
  "message": "Categories retrieved successfully"
}
```

#### Create New Category
- **Endpoint**: `POST /category`
- **Description**: Create a new category
- **Request Body**:
```json
{
  "name": "New Category",
  "description": "Category description"
}
```
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "New Category",
    "description": "Category description",
    "created_at": "2023-08-26T10:30:00Z",
    "updated_at": "2023-08-26T10:30:00Z"
  },
  "message": "Category created successfully"
}
```

#### Update Category
- **Endpoint**: `PUT /category/:id`
- **Description**: Update an existing category
- **Request Body**:
```json
{
  "name": "Updated Category",
  "description": "Updated category description"
}
```
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "Updated Category",
    "description": "Updated category description",
    "created_at": "2023-08-26T10:30:00Z",
    "updated_at": "2023-08-26T11:30:00Z"
  },
  "message": "Category updated successfully"
}
```

#### Delete Category
- **Endpoint**: `DELETE /category/:id`
- **Description**: Delete a category
- **Response Example**:
```json
{
  "success": true,
  "data": null,
  "message": "Category deleted successfully"
}
```

### Suppliers

#### Get All Suppliers
- **Endpoint**: `GET /supplier`
- **Description**: Get all suppliers
- **Response Example**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Test Supplier",
      "contact_person": "John Supplier",
      "email": "supplier@example.com",
      "phone": "123-456-7890",
      "address": "123 Supplier St, City, Country",
      "created_at": "2023-08-26T10:30:00Z",
      "updated_at": "2023-08-26T10:30:00Z"
    },
    {
      "id": 2,
      "name": "Test Supplier 2",
      "contact_person": "Jane Supplier",
      "email": "supplier2@example.com",
      "phone": "098-765-4321",
      "address": "456 Supplier Ave, City, Country",
      "created_at": "2023-08-26T10:30:00Z",
      "updated_at": "2023-08-26T10:30:00Z"
    }
  ],
  "message": "Suppliers retrieved successfully"
}
```

#### Create New Supplier
- **Endpoint**: `POST /supplier`
- **Description**: Create a new supplier
- **Request Body**:
```json
{
  "name": "New Supplier",
  "contact_person": "Supplier Contact",
  "email": "newsupplier@example.com",
  "phone": "555-123-4567",
  "address": "789 Supplier Blvd, City, Country"
}
```
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "New Supplier",
    "contact_person": "Supplier Contact",
    "email": "newsupplier@example.com",
    "phone": "555-123-4567",
    "address": "789 Supplier Blvd, City, Country",
    "created_at": "2023-08-26T10:30:00Z",
    "updated_at": "2023-08-26T10:30:00Z"
  },
  "message": "Supplier created successfully"
}
```

#### Update Supplier
- **Endpoint**: `PUT /supplier/:id`
- **Description**: Update an existing supplier
- **Request Body**:
```json
{
  "name": "Updated Supplier",
  "contact_person": "Updated Contact",
  "email": "updatedsupplier@example.com",
  "phone": "555-987-6543",
  "address": "987 Updated St, City, Country"
}
```
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "Updated Supplier",
    "contact_person": "Updated Contact",
    "email": "updatedsupplier@example.com",
    "phone": "555-987-6543",
    "address": "987 Updated St, City, Country",
    "created_at": "2023-08-26T10:30:00Z",
    "updated_at": "2023-08-26T11:30:00Z"
  },
  "message": "Supplier updated successfully"
}
```

#### Delete Supplier
- **Endpoint**: `DELETE /supplier/:id`
- **Description**: Delete a supplier
- **Response Example**:
```json
{
  "success": true,
  "data": null,
  "message": "Supplier deleted successfully"
}
```

### Customers

#### Get All Customers
- **Endpoint**: `GET /customer`
- **Description**: Get all customers
- **Response Example**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "phone": "123-456-7890",
      "address": "123 Main St, City, Country",
      "loyalty_points": 100,
      "created_at": "2023-08-26T10:30:00Z"
    },
    {
      "id": 2,
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane.smith@example.com",
      "phone": "098-765-4321",
      "address": "456 Oak Ave, Town, Country",
      "loyalty_points": 50,
      "created_at": "2023-08-26T10:30:00Z"
    }
  ],
  "message": "Customers retrieved successfully"
}
```

#### Get Specific Customer
- **Endpoint**: `GET /customer/:id`
- **Description**: Get a specific customer by ID
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "123-456-7890",
    "address": "123 Main St, City, Country",
    "loyalty_points": 100,
    "created_at": "2023-08-26T10:30:00Z"
  },
  "message": "Customer retrieved successfully"
}
```

#### Create New Customer
- **Endpoint**: `POST /customer`
- **Description**: Create a new customer
- **Request Body**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone": "123-456-7890",
  "address": "123 Main St, City, Country",
  "loyalty_points": 0
}
```
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "123-456-7890",
    "address": "123 Main St, City, Country",
    "loyalty_points": 0,
    "created_at": "2023-08-26T10:30:00Z"
  },
  "message": "Customer created successfully"
}
```

#### Update Customer
- **Endpoint**: `PUT /customer/:id`
- **Description**: Update an existing customer
- **Request Body**:
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@example.com",
  "phone": "098-765-4321",
  "address": "456 Oak Ave, Town, Country",
  "loyalty_points": 150
}
```
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@example.com",
    "phone": "098-765-4321",
    "address": "456 Oak Ave, Town, Country",
    "loyalty_points": 150,
    "created_at": "2023-08-26T10:30:00Z"
  },
  "message": "Customer updated successfully"
}
```

#### Delete Customer
- **Endpoint**: `DELETE /customer/:id`
- **Description**: Delete a customer
- **Response Example**:
```json
{
  "success": true,
  "data": null,
  "message": "Customer deleted successfully"
}
```

### Transactions

#### Get All Transactions
- **Endpoint**: `GET /transactions?page=1&limit=10`
- **Description**: Get all transactions with pagination
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10, max: 100)
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "customerId": null,
        "userId": 1,
        "user": {
          "id": 1,
          "username": "john_doe",
          "email": "john@example.com",
          "firstName": "John",
          "lastName": "Doe",
          "role": "CASHIER",
          "is_active": true,
          "created_at": "2023-08-26T10:30:00Z",
          "updated_at": "2023-08-26T10:30:00Z"
        },
        "totalAmount": 89.97,
        "taxAmount": 0,
        "discountAmount": 0,
        "paymentMethod": "cash",
        "status": "completed",
        "createdAt": "2023-08-26T10:30:00Z",
        "transactionItems": [
          {
            "id": 1,
            "productId": 1,
            "quantity": 1,
            "unitPrice": 29.99,
            "totalPrice": 29.99
          },
          {
            "id": 2,
            "productId": 2,
            "quantity": 2,
            "unitPrice": 29.99,
            "totalPrice": 59.98
          }
        ]
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  },
  "message": "Transactions retrieved successfully"
}
```

#### Get Specific Transaction
- **Endpoint**: `GET /transactions/:id`
- **Description**: Get a specific transaction by ID
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customerId": null,
    "userId": 1,
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "CASHIER",
      "is_active": true,
      "created_at": "2023-08-26T10:30:00Z",
      "updated_at": "2023-08-26T10:30:00Z"
    },
    "totalAmount": 89.97,
    "taxAmount": 0,
    "discountAmount": 0,
    "paymentMethod": "cash",
    "status": "completed",
    "createdAt": "2023-08-26T10:30:00Z",
    "transactionItems": [
      {
        "id": 1,
        "productId": 1,
        "quantity": 1,
        "unitPrice": 29.99,
        "totalPrice": 29.99
      },
      {
        "id": 2,
        "productId": 2,
        "quantity": 2,
        "unitPrice": 29.99,
        "totalPrice": 59.98
      }
    ]
  },
  "message": "Transaction retrieved successfully"
}
```

#### Create New Transaction
- **Endpoint**: `POST /transactions`
- **Description**: Create a new transaction
- **Request Body**:
```json
{
  "customerId": null,
  "userId": 1,
  "totalAmount": 89.97,
  "taxAmount": 0,
  "discountAmount": 0,
  "paymentMethod": "cash",
  "status": "completed",
  "items": [
    {
      "productId": 1,
      "quantity": 1,
      "unitPrice": 29.99
    },
    {
      "productId": 2,
      "quantity": 2,
      "unitPrice": 29.99
    }
  ]
}
```
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customerId": null,
    "userId": 1,
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "CASHIER",
      "is_active": true,
      "created_at": "2023-08-26T10:30:00Z",
      "updated_at": "2023-08-26T10:30:00Z"
    },
    "totalAmount": 89.97,
    "taxAmount": 0,
    "discountAmount": 0,
    "paymentMethod": "cash",
    "status": "completed",
    "createdAt": "2023-08-26T10:30:00Z",
    "transactionItems": [
      {
        "id": 1,
        "productId": 1,
        "quantity": 1,
        "unitPrice": 29.99,
        "totalPrice": 29.99
      },
      {
        "id": 2,
        "productId": 2,
        "quantity": 2,
        "unitPrice": 29.99,
        "totalPrice": 59.98
      }
    ]
  },
  "message": "Transaction created successfully"
}
```

#### Update Transaction
- **Endpoint**: `PUT /transactions/:id`
- **Description**: Update an existing transaction (Admin only)
- **Request Body**:
```json
{
  "customerId": 1,
  "userId": 1,
  "totalAmount": 99.97,
  "taxAmount": 5,
  "discountAmount": 0,
  "paymentMethod": "card",
  "status": "completed"
}
```
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customerId": 1,
    "userId": 1,
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "CASHIER",
      "is_active": true,
      "created_at": "2023-08-26T10:30:00Z",
      "updated_at": "2023-08-26T10:30:00Z"
    },
    "totalAmount": 99.97,
    "taxAmount": 5,
    "discountAmount": 0,
    "paymentMethod": "card",
    "status": "completed",
    "createdAt": "2023-08-26T10:30:00Z",
    "transactionItems": [
      {
        "id": 1,
        "productId": 1,
        "quantity": 1,
        "unitPrice": 29.99,
        "totalPrice": 29.99
      },
      {
        "id": 2,
        "productId": 2,
        "quantity": 2,
        "unitPrice": 29.99,
        "totalPrice": 59.98
      }
    ]
  },
  "message": "Transaction updated successfully"
}
```

#### Delete Transaction
- **Endpoint**: `DELETE /transactions/:id`
- **Description**: Delete a transaction (Admin only)
- **Response Example**:
```json
{
  "success": true,
  "data": null,
  "message": "Transaction deleted successfully"
}
```

### Inventory
- `POST /inventory/adjust` - Adjust inventory levels
- `GET /inventory/logs` - Get inventory adjustment logs
- `GET /inventory/low-stock` - Get low stock products

### Users

#### Get All Users
- **Endpoint**: `GET /users?page=1&limit=10`
- **Description**: Get all users with pagination
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10, max: 100)
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "CASHIER",
        "created_at": "2023-08-26T10:30:00Z",
        "updated_at": "2023-08-26T10:30:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  },
  "message": "Users retrieved successfully"
}
```

#### Get Specific User
- **Endpoint**: `GET /users/:id`
- **Description**: Get a specific user by ID
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CASHIER",
    "created_at": "2023-08-26T10:30:00Z",
    "updated_at": "2023-08-26T10:30:00Z"
  },
  "message": "User retrieved successfully"
}
```

#### Create New User
- **Endpoint**: `POST /users`
- **Description**: Create a new user
- **Request Body**:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "role": "CASHIER"
}
```
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CASHIER",
    "created_at": "2023-08-26T10:30:00Z",
    "updated_at": "2023-08-26T10:30:00Z"
  },
  "message": "User created successfully"
}
```

#### Update User
- **Endpoint**: `PUT /users/:id`
- **Description**: Update an existing user
- **Request Body**:
```json
{
  "username": "john_doe_updated",
  "email": "john_updated@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "ADMIN"
}
```
- **Response Example**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "john_doe_updated",
    "email": "john_updated@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "ADMIN",
    "created_at": "2023-08-26T10:30:00Z",
    "updated_at": "2023-08-26T11:30:00Z"
  },
  "message": "User updated successfully"
}
```

#### Delete User
- **Endpoint**: `DELETE /users/:id`
- **Description**: Delete a user
- **Response Example**:
```json
{
  "success": true,
  "data": null,
  "message": "User deleted successfully"
}
```

#### Search Users
- **Endpoint**: `GET /users/search?query=searchterm`
- **Description**: Search users by name, email, or username
- **Query Parameters**:
  - `query`: Search term
- **Response Example**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "CASHIER",
      "created_at": "2023-08-26T10:30:00Z",
      "updated_at": "2023-08-26T10:30:00Z"
    }
  ],
  "message": "Users search completed successfully"
}
```

### Reports
- `GET /reports/sales-summary` - Get sales summary
- `GET /reports/top-products` - Get top selling products
- `GET /reports/profit-margin` - Get profit margin report