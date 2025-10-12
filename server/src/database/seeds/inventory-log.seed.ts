import { DataSource } from 'typeorm';
import { InventoryLog } from '../../inventory/entities/inventory-log.entity';
import { Product } from '../../product/entity/product.entity';
import { User } from '../../user/entity/user.entity';

export const seedInventoryLogs = async (dataSource: DataSource) => {
  const inventoryLogRepository = dataSource.getRepository(InventoryLog);
  const productRepository = dataSource.getRepository(Product);
  const userRepository = dataSource.getRepository(User);

  // Check if inventory logs already exist to avoid duplicates
  const existingLogs = await inventoryLogRepository.find();
  if (existingLogs.length > 0) {
    console.log('Inventory logs already exist, skipping seeding');
    return;
  }

  // Get products and users to associate with inventory logs
  const products = await productRepository.find();
  const users = await userRepository.find();

  if (products.length === 0) {
    console.log('Products not found, please seed products first');
    return;
  }

  if (users.length === 0) {
    console.log('Users not found, please seed users first');
    return;
  }

  // Use the first user (admin) for all inventory logs
  const adminUser = users[0];

  const inventoryLogs = [
    {
      product_id: products[0].id, // Laptop
      change_amount: 50, // Initial stock
      reason: 'Initial Stock',
      user_id: adminUser.id,
    },
    {
      product_id: products[1].id, // Smartphone
      change_amount: 75, // Initial stock
      reason: 'Initial Stock',
      user_id: adminUser.id,
    },
    {
      product_id: products[0].id, // Laptop
      change_amount: -5, // Sold 5 units
      reason: 'Sale',
      user_id: adminUser.id,
    },
    {
      product_id: products[2].id, // T-Shirt
      change_amount: 100, // Initial stock
      reason: 'Initial Stock',
      user_id: adminUser.id,
    },
    {
      product_id: products[3].id, // Coffee Maker
      change_amount: 25, // Initial stock
      reason: 'Initial Stock',
      user_id: adminUser.id,
    },
    {
      product_id: products[0].id, // Laptop
      change_amount: 20, // Restocked
      reason: 'Restock',
      user_id: adminUser.id,
    },
    {
      product_id: products[1].id, // Smartphone
      change_amount: -10, // Sold 10 units
      reason: 'Sale',
      user_id: adminUser.id,
    },
    {
      product_id: products[4].id, // Novel Book
      change_amount: 150, // Initial stock
      reason: 'Initial Stock',
      user_id: adminUser.id,
    },
    {
      product_id: products[3].id, // Coffee Maker
      change_amount: -3, // Sold 3 units
      reason: 'Sale',
      user_id: adminUser.id,
    },
    {
      product_id: products[5].id, // Tennis Racket
      change_amount: -2, // Sold 2 units
      reason: 'Sale',
      user_id: adminUser.id,
    },
  ];

  for (const log of inventoryLogs) {
    const newLog = inventoryLogRepository.create(log);
    await inventoryLogRepository.save(newLog);
    console.log(
      `Created inventory log: ${log.reason} for product ID ${log.product_id}, change: ${log.change_amount}`,
    );
  }
};
