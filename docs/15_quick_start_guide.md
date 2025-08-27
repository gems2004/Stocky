# Quick Start Guide

## Getting Started with Stocky

This guide will help you quickly get started with Stocky.

## Prerequisites
- Node.js >= 20.x
- pnpm >= 10.x
- PostgreSQL >= 15.x
- Git

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Stocky
   ```

2. Install dependencies for both frontend and backend:
   ```bash
   # Install backend dependencies
   cd server
   pnpm install
   cd ..
   
   # Install frontend dependencies
   cd client
   pnpm install
   cd ..
   ```

## Initial Setup

When you first run the application, you'll need to go through the initial setup process:

1. Start the development servers:
   ```bash
   # In one terminal, start the backend
   cd server
   pnpm run dev
   
   # In another terminal, start the frontend
   cd client
   pnpm dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

3. You'll be redirected to the Initial Setup Wizard if this is your first time running the application

4. Follow the steps in the wizard:
   - Configure your shop information
   - Set up database connection
   - Create your administrator account
   - Complete initial configuration

For detailed information about the initial setup process, please refer to the [Initial Setup Guide](14_initial_setup.md).

## After Setup

Once you've completed the initial setup:
1. You'll be redirected to the login page
2. Log in with your administrator credentials
3. Explore the dashboard and features

## Next Steps

- Add your first products
- Configure tax settings
- Set up user accounts for your team
- Customize system settings

## Troubleshooting

If you encounter issues during setup:
1. Check that all prerequisites are installed and running
2. Verify database connectivity
3. Review the detailed [Initial Setup Guide](14_initial_setup.md) for troubleshooting tips
4. Check application logs for error messages