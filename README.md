# README.md

# Shop Management System with POS

A comprehensive shop management system with Point of Sale (POS) capabilities designed for small to medium retail businesses.

## Features

- **Product Management**: Add, edit, delete products with categories and suppliers
- **Inventory Tracking**: Real-time stock levels with low stock alerts
- **Point of Sale**: Fast, intuitive POS interface with barcode scanning support
- **Sales Management**: Transaction history and sales reporting
- **Customer Management**: Customer database with purchase history
- **User Management**: Role-based access control (admin, manager, cashier)
- **Reporting**: Comprehensive sales and inventory reports

## Technology Stack

- **Frontend**: Next.js with TypeScript, ShadCN/Tailwind
- **Backend**: Django with Python
- **Database**: PostgreSQL
- **State Management**: Redux Toolkit
- **Testing**: Jest, React Testing Library, Cypress

## Documentation

All project documentation is available in the `docs/` directory:

1. [Project Overview](docs/01_project_overview.md)
2. [Requirements Specification](docs/02_requirements.md)
3. [Database Design](docs/03_database_design.md)
4. [API Design](docs/04_api_design.md)
5. [Frontend Architecture](docs/05_frontend_architecture.md)
6. [UI Design](docs/06_ui_design.md)
7. [Development Plan](docs/07_development_plan.md)
8. [Testing Strategy](docs/08_testing_strategy.md)
9. [Deployment Guide](docs/09_deployment_guide.md)
10. [Project Roadmap](docs/10_roadmap.md)
11. [User Manual](docs/11_user_manual.md)

## Getting Started

### Prerequisites
- Node.js >= 14.x
- npm >= 6.x
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ShopSystem
   ```

2. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd client
   npm install
   ```

4. Start the development servers:
   ```bash
   # In server directory
   npm run dev

   # In client directory
   npm start
   ```

## Development

This project follows a phased development approach:

1. **Phase 1**: Foundation (Backend setup, basic models, authentication)
2. **Phase 2**: Core functionality (Product/Customer management)
3. **Phase 3**: POS System (Shopping cart, payment processing)
4. **Phase 4**: Advanced features (Reporting, user management)
5. **Phase 5**: Testing & Deployment
6. **Phase 6**: Polish & Documentation

See [Development Plan](docs/07_development_plan.md) for detailed timeline.

## Testing

- Unit tests: `npm test`
- Integration tests: `npm run test:integration`
- End-to-end tests: `npm run test:e2e`

See [Testing Strategy](docs/08_testing_strategy.md) for comprehensive testing approach.

## Deployment

See [Deployment Guide](docs/09_deployment_guide.md) for detailed deployment instructions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For questions or support, please open an issue on the repository.