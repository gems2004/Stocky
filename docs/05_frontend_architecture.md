# Frontend Architecture

## Component Structure

### Layout Components
- `AppLayout` - Main application layout
- `Header` - Top navigation bar
- `Sidebar` - Side navigation menu
- `Footer` - Page footer

### Page Components
- `Dashboard` - Main dashboard with key metrics
- `ProductsList` - Product management page
- `ProductForm` - Product creation/editing form
- `POS` - Point of sale interface
- `TransactionsList` - Sales history page
- `TransactionDetail` - Transaction details view
- `CustomersList` - Customer management page
- `CustomerForm` - Customer creation/editing form
- `InventoryReport` - Inventory tracking page
- `Settings` - Application settings
- `Login` - Authentication page

### Reusable Components
- `ProductCard` - Display product information
- `SearchBar` - Universal search component
- `Cart` - Shopping cart for POS
- `PaymentModal` - Payment processing modal
- `Receipt` - Receipt display/printing component
- `DataTable` - Reusable data table with sorting/pagination
- `FormInput` - Standardized form input fields
- `LoadingSpinner` - Loading indicator
- `Alert` - Notification component

## State Management (Redux)

### Slices
- `auth` - User authentication state
- `products` - Product data and operations
- `cart` - POS shopping cart
- `transactions` - Sales transactions
- `customers` - Customer data
- `inventory` - Inventory levels and logs
- `ui` - UI state (loading, notifications, etc.)

## Routing
- `/` - Dashboard
- `/pos` - Point of sale
- `/products` - Product management
- `/products/new` - Create product
- `/products/:id/edit` - Edit product
- `/transactions` - Sales history
- `/transactions/:id` - Transaction details
- `/customers` - Customer management
- `/customers/new` - Create customer
- `/customers/:id/edit` - Edit customer
- `/inventory` - Inventory tracking
- `/reports` - Sales reports
- `/settings` - Application settings
- `/login` - User login

## Styling
- ShadCN components
- Custom theme configuration
- Responsive design for mobile/desktop
- Consistent color scheme and typography