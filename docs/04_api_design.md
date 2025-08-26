# API Design

## Base URL
`http://localhost:3001/api`

## Authentication
All API requests (except login) require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Error Responses
All error responses follow this format:
```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

## Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
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