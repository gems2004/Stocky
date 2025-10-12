import { DataSource } from 'typeorm';
import { Transaction } from '../../transaction/entity/transaction.entity';
import { TransactionItem } from '../../transaction/entity/transaction-item.entity';
import { Product } from '../../product/entity/product.entity';
import { User } from '../../user/entity/user.entity';
import { Customer } from '../../customer/entities/customer.entity';

export const seedTransactions = async (dataSource: DataSource) => {
  const transactionRepository = dataSource.getRepository(Transaction);
  const productRepository = dataSource.getRepository(Product);
  const userRepository = dataSource.getRepository(User);
  const customerRepository = dataSource.getRepository(Customer);

  // Check if transactions already exist to avoid duplicates
  const existingTransactions = await transactionRepository.find();
  if (existingTransactions.length > 0) {
    console.log('Transactions already exist, skipping seeding');
    return;
  }

  // Get products, users, and customers to associate with transactions
  const products = await productRepository.find();
  const users = await userRepository.find();
  const customers = await customerRepository.find();

  if (products.length === 0) {
    console.log('Products not found, please seed products first');
    return;
  }

  if (users.length === 0) {
    console.log('Users not found, please seed users first');
    return;
  }

  // Use the first user and customer for transactions
  const user = users[0];
  const customer = customers.length > 0 ? customers[0] : null;

  const transactions = [
    {
      customerId: customer ? customer.id : null,
      userId: user.id,
      totalAmount: 1049.97, // For laptop and smartphone
      taxAmount: 84.0,
      discountAmount: 0,
      paymentMethod: 'credit_card',
      status: 'completed',
    },
    {
      customerId: customer ? customer.id : null,
      userId: user.id,
      totalAmount: 39.98, // For t-shirts
      taxAmount: 3.2,
      discountAmount: 0,
      paymentMethod: 'cash',
      status: 'completed',
    },
    {
      customerId: null, // Walk-in customer
      userId: user.id,
      totalAmount: 209.94, // Coffee maker and novel book
      taxAmount: 16.79,
      discountAmount: 10, // $10 discount
      paymentMethod: 'debit_card',
      status: 'completed',
    },
  ];

  for (const transData of transactions) {
    // Handle nullable customer_id properly - only include it if it's not null
    const transactionData: any = {
      user_id: transData.userId,
      total_amount: transData.totalAmount,
      tax_amount: transData.taxAmount,
      discount_amount: transData.discountAmount,
      payment_method: transData.paymentMethod,
      status: transData.status,
    };

    // Only add customer_id if it's not null
    if (transData.customerId !== null) {
      transactionData.customer_id = transData.customerId;
    }

    const newTransaction = transactionRepository.create(transactionData);

    const savedTransactionResult = await transactionRepository.save(newTransaction);
    // Handle the return value - sometimes save() returns an array
    const savedTransaction = Array.isArray(savedTransactionResult) 
      ? savedTransactionResult[0] 
      : savedTransactionResult;
      
    console.log(
      `Created transaction: ID ${savedTransaction.id}, Total: ${transData.totalAmount}`,
    );

    // Create transaction items for each transaction
    // For the first transaction (laptop and smartphone)
    if (savedTransaction.id === 1 && products.length >= 2) {
      const transactionItemRepository =
        dataSource.getRepository(TransactionItem);

      // Laptop item
      const laptopItem = transactionItemRepository.create({
        transaction_id: savedTransaction.id,
        product_id: products[0].id, // Laptop
        quantity: 1,
        unit_price: products[0].price,
        total_price: products[0].price,
      });
      await transactionItemRepository.save(laptopItem);

      // Smartphone item
      const smartphoneItem = transactionItemRepository.create({
        transaction_id: savedTransaction.id,
        product_id: products[1].id, // Smartphone
        quantity: 1,
        unit_price: products[1].price,
        total_price: products[1].price,
      });
      await transactionItemRepository.save(smartphoneItem);
    }
    // For the second transaction (t-shirts)
    else if (savedTransaction.id === 2 && products.length >= 3) {
      const transactionItemRepository =
        dataSource.getRepository(TransactionItem);

      // T-shirts item
      const tshirtItem = transactionItemRepository.create({
        transaction_id: savedTransaction.id,
        product_id: products[2].id, // T-Shirt
        quantity: 2,
        unit_price: products[2].price,
        total_price: products[2].price * 2,
      });
      await transactionItemRepository.save(tshirtItem);
    }
    // For the third transaction (coffee maker and novel book)
    else if (savedTransaction.id === 3 && products.length >= 5) {
      const transactionItemRepository =
        dataSource.getRepository(TransactionItem);

      // Coffee maker item
      const coffeeMakerItem = transactionItemRepository.create({
        transaction_id: savedTransaction.id,
        product_id: products[3].id, // Coffee Maker
        quantity: 1,
        unit_price: products[3].price,
        total_price: products[3].price,
      });
      await transactionItemRepository.save(coffeeMakerItem);

      // Novel book item
      const novelBookItem = transactionItemRepository.create({
        transaction_id: savedTransaction.id,
        product_id: products[4].id, // Novel Book
        quantity: 1,
        unit_price: products[4].price,
        total_price: products[4].price,
      });
      await transactionItemRepository.save(novelBookItem);
    }
  }
};
