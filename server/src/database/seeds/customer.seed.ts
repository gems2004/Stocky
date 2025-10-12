import { DataSource } from 'typeorm';
import { Customer } from '../../customer/entities/customer.entity';

export const seedCustomers = async (dataSource: DataSource) => {
  const customerRepository = dataSource.getRepository(Customer);
  
  // Check if customers already exist to avoid duplicates
  const existingCustomers = await customerRepository.find();
  if (existingCustomers.length > 0) {
    console.log('Customers already exist, skipping seeding');
    return;
  }
  
  const customers = [
    {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      address: '123 Main St, Anytown, USA',
      loyalty_points: 150,
    },
    {
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+1234567891',
      address: '456 Oak Ave, Somewhere, USA',
      loyalty_points: 75,
    },
    {
      first_name: 'Bob',
      last_name: 'Johnson',
      email: 'bob.johnson@example.com',
      phone: '+1234567892',
      address: '789 Pine Rd, Elsewhere, USA',
      loyalty_points: 200,
    },
  ];
  
  for (const customer of customers) {
    const newCustomer = customerRepository.create(customer);
    await customerRepository.save(newCustomer);
    console.log(`Created customer: ${customer.first_name} ${customer.last_name}`);
  }
};