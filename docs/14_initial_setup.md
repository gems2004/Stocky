# Initial Setup Guide

## Overview

When a user starts Stocky for the first time, they need to go through an initial setup process to configure the application with their specific shop information, database connection, and initial settings.

## First-Time Setup Process

### 1. Welcome Screen

-   Display welcome message
-   Brief introduction to Stocky
-   Option to start setup or import existing configuration

### 2. Shop Information Configuration

Users need to provide basic information about their shop:

#### Required Information:

-   **Shop Name**: The name of the business/shop
-   **Shop Address**: Physical address of the shop
-   **Contact Information**:
    -   Phone number
    -   Email address
    -   Website (optional)

#### Optional Information:

-   **Business Type**: Select from predefined categories (retail, restaurant, service, etc.)
-   **Currency**: Default currency for transactions
-   **Tax Settings**: Default tax rates and rules
-   **Logo**: Upload shop logo (optional)

### 3. Database Configuration

Users need to configure the database connection:

#### Connection Settings:

-   **Database Type**: PostgreSQL (currently the only supported option)
-   **Host**: Database server address
-   **Port**: Database port (default: 5432)
-   **Database Name**: Name of the database to use
-   **Username**: Database user credentials
-   **Password**: Database user credentials

#### Database Options:

-   **Create New Database**: Option to create a new database if it doesn't exist
-   **Use Existing Database**: Option to use an existing database (with warnings about data loss)
-   **Connection Test**: Button to verify database connectivity

### 4. Administrator Account Setup

Create the first administrative user account:

#### Required Information:

-   **Username**: Admin username
-   **Email**: Admin email address
-   **Password**: Secure password (with strength indicator)
-   **Confirm Password**: Password confirmation

#### Optional Information:

-   **First Name**: Administrator's first name
-   **Last Name**: Administrator's last name
### 5. Setup Completion

-   Display summary of configured settings
-   Option to review and edit any information
-   Finalize setup and create configuration files
-   Redirect to login page

## Configuration Files

### Server Configuration

The backend creates a `.env` file in the server directory with:

-   Database connection string
-   JWT secret
-   Server port
-   Other environment-specific settings

### Client Configuration

The frontend creates a `.env` file in the client directory with:

-   API endpoint URL
-   Client-specific settings

## Implementation Considerations

### Security

-   Passwords should be properly hashed before storage
-   Database credentials should be encrypted if stored
-   Configuration files should have appropriate file permissions

### Validation

-   All user inputs should be validated
-   Database connection should be tested before proceeding
-   Required fields should be clearly marked

### Error Handling

-   Clear error messages for failed database connections
-   Guidance for resolving common setup issues
-   Option to retry or modify settings

### Rollback

-   Option to restart setup if needed
-   Clean up partially created configuration files
-   Reset database if initialization failed

## Post-Setup Tasks

### First Login

-   Redirect to admin login after setup
-   Display welcome dashboard
-   Show quick start guide or tutorial

### Maintenance

-   Configuration files should be editable in the admin panel
-   Backup of configuration settings

## Troubleshooting

### Common Issues

-   Database connection failures
-   Invalid shop information
-   Weak password requirements
-   File permission issues

### Diagnostic Steps

-   Verify database connectivity
-   Check configuration file permissions
-   Validate required fields
-   Review system logs for errors
