# Setup Module Tests

# 1. Get setup status
GET http://localhost:3500/setup/status

HTTP/1.1 200
[Asserts]
jsonpath "$.success" == true
jsonpath "$.message" == "Setup status retrieved successfully"
jsonpath "$.data.isSetupComplete" exists

# 2. Configure shop information
POST http://localhost:3500/setup/shop
Content-Type: application/json

{
  "name": "Test Shop",
  "address": "123 Test Street",
  "phone": "123-456-7890",
  "email": "test@example.com",
  "currency": "USD",
  "businessType": "retail",
  "website": "https://testshop.com"
}

HTTP/1.1 200
[Asserts]
jsonpath "$.success" == true
jsonpath "$.message" == "Shop information configured successfully"
jsonpath "$.data.isSetupComplete" exists

# 3. Configure database
POST http://localhost:3500/setup/database
Content-Type: application/json

{
  "type": "postgres",
  "host": "localhost",
  "port": "5432",
  "username": "george",
  "password": "zaq321xsw",
  "database": "stocky",
  "ssl": false
}

HTTP/1.1 200
[Asserts]
jsonpath "$.success" == true
jsonpath "$.message" == "Database configured successfully"
jsonpath "$.data.isSetupComplete" exists

# 4. Create admin user (this is a public endpoint during initial setup)
POST http://localhost:3500/users
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@example.com",
  "password": "admin123",
  "firstName": "Admin",
  "lastName": "User",
  "role": "ADMIN"
}

HTTP/1.1 201
[Captures]
admin_user_id: jsonpath "$.data.id"

[Asserts]
jsonpath "$.success" == true
jsonpath "$.message" == "User created successfully"
jsonpath "$.data.username" == "admin"
jsonpath "$.data.role" == "ADMIN"
jsonpath "$.data.email" == "admin@example.com"

# 5. Complete setup
POST http://localhost:3500/setup/complete

HTTP/1.1 200
[Asserts]
jsonpath "$.success" == true
jsonpath "$.message" == "Setup process completed successfully"
jsonpath "$.data.isSetupComplete" == true