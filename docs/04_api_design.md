 # API Design

## Base URL
`http://localhost:3000/api`

## Authentication
All API requests (except login) require a valid JWT token in the Authorization header:
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

## Endpoints

### Initial Setup
- `GET /setup/status` - Check if system is already set up
- `POST /setup/database` - Configure database connection
- `POST /setup/shop` - Configure shop information
- `POST /setup/admin` - Create administrator account
- `POST /setup/complete` - Finalize setup process

### Authentication
- `POST /auth/register` - User register
- `POST /auth/login` - User login
-  `GET /auth/refresh` - Refresh access token
- `GET /auth/profile` - Get current user profile

### Products
- `GET /products` - Get all products (with pagination/filtering)
- `GET /products/:id` - Get specific product
- `POST /products` - Create new product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- `GET /products/search?q=:query` - Search products

### Categories
- `GET /categories` - Get all categories
- `POST /categories` - Create new category
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

### Suppliers
- `GET /suppliers` - Get all suppliers
- `POST /suppliers` - Create new supplier
- `PUT /suppliers/:id` - Update supplier
- `DELETE /suppliers/:id` - Delete supplier

### Customers
- `GET /customers` - Get all customers (with pagination/filtering)
- `GET /customers/:id` - Get specific customer
- `POST /customers` - Create new customer
- `PUT /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer

### Transactions
- `GET /transactions` - Get all transactions (with pagination/filtering)
- `GET /transactions/:id` - Get specific transaction
- `POST /transactions` - Create new transaction
- `PUT /transactions/:id` - Update transaction
- `DELETE /transactions/:id` - Delete transaction

### Inventory
- `POST /inventory/adjust` - Adjust inventory levels
- `GET /inventory/logs` - Get inventory adjustment logs
- `GET /inventory/low-stock` - Get low stock products

### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get specific user
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Reports
- `GET /reports/sales-summary` - Get sales summary
- `GET /reports/top-products` - Get top selling products
- `GET /reports/profit-margin` - Get profit margin report