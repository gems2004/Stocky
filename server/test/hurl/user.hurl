# User Module Tests

# First, create and login as admin user to get access token
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

# Login as admin to get access token
POST http://localhost:3500/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

HTTP/1.1 200
[Captures]
admin_access_token: jsonpath "$.data.tokens.accessToken"

# Create a cashier user
POST http://localhost:3500/users
Content-Type: application/json

{
  "username": "testcashier",
  "email": "testcashier@example.com",
  "password": "password123",
  "firstName": "Test",
  "lastName": "Cashier",
  "role": "CASHIER"
}

HTTP/1.1 201
[Captures]
cashier_user_id: jsonpath "$.data.id"

# Login as cashier to get access token
POST http://localhost:3500/auth/login
Content-Type: application/json

{
  "username": "testcashier",
  "password": "password123"
}

HTTP/1.1 200
[Captures]
cashier_access_token: jsonpath "$.data.tokens.accessToken"

# 1. Get all users as admin (should succeed)
GET http://localhost:3500/users
Authorization: Bearer {{admin_access_token}}

HTTP/1.1 200
[Asserts]
jsonpath "$.success" == true
jsonpath "$.message" == "Users retrieved successfully"
jsonpath "$.data.data" exists
jsonpath "$.data.total" exists

# 2. Get all users as cashier (should succeed)
GET http://localhost:3500/users
Authorization: Bearer {{cashier_access_token}}

HTTP/1.1 200
[Asserts]
jsonpath "$.success" == true
jsonpath "$.message" == "Users retrieved successfully"
jsonpath "$.data.data" exists
jsonpath "$.data.total" exists

# 3. Get all users without authentication (should fail)
GET http://localhost:3500/users

HTTP/1.1 401

# 4. Get specific user by ID as admin (should succeed)
GET http://localhost:3500/users/{{admin_user_id}}
Authorization: Bearer {{admin_access_token}}

HTTP/1.1 200
[Asserts]
jsonpath "$.success" == true
jsonpath "$.message" == "User retrieved successfully"
jsonpath "$.data.id" == {{admin_user_id}}
jsonpath "$.data.username" == "admin"

# 5. Get specific user by ID as cashier (should succeed)
GET http://localhost:3500/users/{{cashier_user_id}}
Authorization: Bearer {{cashier_access_token}}

HTTP/1.1 200
[Asserts]
jsonpath "$.success" == true
jsonpath "$.message" == "User retrieved successfully"
jsonpath "$.data.id" == {{cashier_user_id}}
jsonpath "$.data.username" == "testcashier"

# 6. Get specific user by ID without authentication (should fail)
GET http://localhost:3500/users/{{admin_user_id}}

HTTP/1.1 401

# 7. Create a new user as admin (should succeed)
POST http://localhost:3500/users
Content-Type: application/json
Authorization: Bearer {{admin_access_token}}

{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "newpassword123",
  "firstName": "New",
  "lastName": "User",
  "role": "CASHIER"
}

HTTP/1.1 201
[Captures]
new_user_id: jsonpath "$.data.id"

[Asserts]
jsonpath "$.success" == true
jsonpath "$.message" == "User created successfully"
jsonpath "$.data.username" == "newuser"

# 8. Update user as admin (should succeed)
PUT http://localhost:3500/users/{{new_user_id}}
Content-Type: application/json
Authorization: Bearer {{admin_access_token}}

{
  "username": "updateduser",
  "email": "updated@example.com",
  "firstName": "Updated",
  "lastName": "User",
  "role": "CASHIER"
}

HTTP/1.1 200
[Asserts]
jsonpath "$.success" == true
jsonpath "$.message" == "User updated successfully"
jsonpath "$.data.username" == "updateduser"

# 9. Update user as cashier (should fail - unauthorized)
PUT http://localhost:3500/users/{{new_user_id}}
Content-Type: application/json
Authorization: Bearer {{cashier_access_token}}

{
  "username": "unauthorizedupdate",
  "email": "unauthorized@example.com",
  "firstName": "Unauthorized",
  "lastName": "Update",
  "role": "CASHIER"
}

HTTP/1.1 403

# 10. Delete user as admin (should succeed)
DELETE http://localhost:3500/users/{{new_user_id}}
Authorization: Bearer {{admin_access_token}}

HTTP/1.1 200
[Asserts]
jsonpath "$.success" == true
jsonpath "$.message" == "User deleted successfully"

# 11. Delete user as cashier (should fail - unauthorized)
DELETE http://localhost:3500/users/{{admin_user_id}}
Authorization: Bearer {{cashier_access_token}}

HTTP/1.1 403

# 12. Search users as admin (should succeed)
GET http://localhost:3500/users/search?query=admin
Authorization: Bearer {{admin_access_token}}

HTTP/1.1 200
[Asserts]
jsonpath "$.success" == true
jsonpath "$.message" == "Users search completed successfully"
jsonpath "$.data" exists

# 13. Search users as cashier (should succeed)
GET http://localhost:3500/users/search?query=admin
Authorization: Bearer {{cashier_access_token}}

HTTP/1.1 200
[Asserts]
jsonpath "$.success" == true
jsonpath "$.message" == "Users search completed successfully"
jsonpath "$.data" exists

# 14. Search users without authentication (should fail)
GET http://localhost:3500/users/search?query=admin

HTTP/1.1 401