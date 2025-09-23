# Stocky API Tests

# Include setup tests
GET file:///home/george/programming/projects/Stocky/server/test/hurl/setup.hurl

###

# Include first admin user creation test
GET file:///home/george/programming/projects/Stocky/server/test/hurl/first-admin.hurl

###

# Include auth tests
GET file:///home/george/programming/projects/Stocky/server/test/hurl/auth.hurl

###

# Include user tests
GET file:///home/george/programming/projects/Stocky/server/test/hurl/user.hurl