import { DataSource } from 'typeorm';
import { Product } from '../../product/entity/product.entity';
import { Category } from '../../category/entities/category.entity';
import { Supplier } from '../../supplier/entities/supplier.entity';

export const seedProducts = async (dataSource: DataSource) => {
  const productRepository = dataSource.getRepository(Product);
  const categoryRepository = dataSource.getRepository(Category);
  const supplierRepository = dataSource.getRepository(Supplier);

  // Check if products already exist to avoid duplicates
  const existingProducts = await productRepository.find();
  if (existingProducts.length > 0) {
    console.log('Products already exist, skipping seeding');
    return;
  }

  // Get categories and suppliers to associate with products
  const categories = await categoryRepository.find();
  const suppliers = await supplierRepository.find();

  if (categories.length === 0 || suppliers.length === 0) {
    console.log('Categories or suppliers not found, please seed them first');
    return;
  }

  const products = [
    {
      name: 'Laptop',
      description: 'High performance laptop for work and gaming',
      price: 999.99,
      cost: 750.0,
      categoryId:
        categories.find((cat) => cat.name === 'Electronics')?.id ||
        categories[0].id,
      supplierId:
        suppliers.find((sup) => sup.name === 'Tech Supplies Co.')?.id ||
        suppliers[0].id,
      barcode: '1234567890123',
      sku: 'LP-001',
      minStockLevel: 10,
      stockQuantity: 50,
    },
    {
      name: 'Smartphone',
      description: 'Latest model smartphone with advanced features',
      price: 699.99,
      cost: 500.0,
      categoryId:
        categories.find((cat) => cat.name === 'Electronics')?.id ||
        categories[0].id,
      supplierId:
        suppliers.find((sup) => sup.name === 'Tech Supplies Co.')?.id ||
        suppliers[0].id,
      barcode: '1234567890124',
      sku: 'SP-001',
      minStockLevel: 15,
      stockQuantity: 75,
    },
    {
      name: 'T-Shirt',
      description: 'Cotton t-shirt in various colors',
      price: 19.99,
      cost: 10.0,
      categoryId:
        categories.find((cat) => cat.name === 'Clothing')?.id ||
        categories[1].id,
      supplierId:
        suppliers.find((sup) => sup.name === 'Fashion Distributors')?.id ||
        suppliers[1].id,
      barcode: '1234567890125',
      sku: 'TS-001',
      minStockLevel: 20,
      stockQuantity: 100,
    },
    {
      name: 'Coffee Maker',
      description: 'Automatic coffee maker with timer',
      price: 89.99,
      cost: 50.0,
      categoryId:
        categories.find((cat) => cat.name === 'Home & Kitchen')?.id ||
        categories[2].id,
      supplierId:
        suppliers.find((sup) => sup.name === 'Home Essentials Ltd')?.id ||
        suppliers[2].id,
      barcode: '1234567890126',
      sku: 'CM-001',
      minStockLevel: 5,
      stockQuantity: 25,
    },
    {
      name: 'Novel Book',
      description: 'Best-selling fiction novel',
      price: 14.99,
      cost: 7.0,
      categoryId:
        categories.find((cat) => cat.name === 'Books')?.id || categories[3].id,
      supplierId:
        suppliers.find((sup) => sup.name === 'Book Publishers Inc')?.id ||
        suppliers[3].id,
      barcode: '1234567890127',
      sku: 'NB-001',
      minStockLevel: 30,
      stockQuantity: 150,
    },
    {
      name: 'Tennis Racket',
      description: 'Professional tennis racket',
      price: 129.99,
      cost: 80.0,
      categoryId:
        categories.find((cat) => cat.name === 'Sports & Outdoors')?.id ||
        categories[4].id,
      supplierId:
        suppliers.find((sup) => sup.name === 'Outdoor Gear Supply')?.id ||
        suppliers[4].id,
      barcode: '1234567890128',
      sku: 'TR-001',
      minStockLevel: 8,
      stockQuantity: 40,
    },
  ];

  for (const productData of products) {
    const newProduct = productRepository.create({
      name: productData.name,
      description: productData.description,
      price: productData.price,
      cost: productData.cost,
      category_id: productData.categoryId,
      supplier_id: productData.supplierId,
      barcode: productData.barcode,
      sku: productData.sku,
      stock_quantity: productData.stockQuantity,
      min_stock_level: productData.minStockLevel,
    });
    await productRepository.save(newProduct);
    console.log(`Created product: ${productData.name}`);
  }
};
