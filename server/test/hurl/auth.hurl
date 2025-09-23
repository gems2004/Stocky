# Auth Module Tests

# 1. Login with valid credentials
POST http://localhost:3500/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

HTTP/1.1 200
[Captures]
access_token: jsonpath "$.data.tokens.accessToken"
refresh_token: jsonpath "$.data.tokens.refreshToken"
user_id: jsonpath "$.data.user.id"
username: jsonpath "$.data.user.username"

[Asserts]
jsonpath "$.success" == true
jsonpath "$.message" == "Login successful"
jsonpath "$.data.user.username" == "admin"
jsonpath "$.data.tokens.accessToken" exists
jsonpath "$.data.tokens.refreshToken" exists

# 2. Login with invalid credentials
POST http://localhost:3500/auth/login
Content-Type: application/json

{
  "username": "invalid",
  "password": "wrongpassword"
}

HTTP/1.1 401
[Asserts]
jsonpath "$.success" == false
jsonpath "$.error.message" == "Invalid credentials"

# 3. Refresh token with valid refresh token
POST http://localhost:3500/auth/refresh
Content-Type: application/json

{
  "refreshToken": "{{refresh_token}}"
}

HTTP/1.1 200
[Captures]
new_access_token: jsonpath "$.data.tokens.accessToken"
new_refresh_token: jsonpath "$.data.tokens.refreshToken"

[Asserts]
jsonpath "$.success" == true
jsonpath "$.message" == "Token refreshed successfully"
jsonpath "$.data.tokens.accessToken" exists
jsonpath "$.data.tokens.refreshToken" exists

# 4. Refresh token with invalid refresh token
POST http://localhost:3500/auth/refresh
Content-Type: application/json

{
  "refreshToken": "invalid_token"
}

HTTP/1.1 401
[Asserts]
jsonpath "$.success" == false
jsonpath "$.error.message" == "Invalid refresh token"

# 5. Get profile with valid access token
GET http://localhost:3500/auth/profile
Authorization: Bearer {{access_token}}

HTTP/1.1 200
[Asserts]
jsonpath "$.success" == true
jsonpath "$.message" == "Profile retrieved successfully"
jsonpath "$.data.user.id" == {{user_id}}
jsonpath "$.data.user.username" == "{{username}}"

# 6. Get profile with invalid access token
GET http://localhost:3500/auth/profile
Authorization: Bearer invalid_token

HTTP/1.1 401
[Asserts]
jsonpath "$.success" == false
jsonpath "$.error.message" contains "Invalid or expired token"