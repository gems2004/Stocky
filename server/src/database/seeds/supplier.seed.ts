import { DataSource } from 'typeorm';
import { Supplier } from '../../supplier/entities/supplier.entity';

export const seedSuppliers = async (dataSource: DataSource) => {
  const supplierRepository = dataSource.getRepository(Supplier);

  // Check if suppliers already exist to avoid duplicates
  const existingSuppliers = await supplierRepository.find();
  if (existingSuppliers.length > 0) {
    console.log('Suppliers already exist, skipping seeding');
    return;
  }

  const suppliers = [
    {
      name: 'Tech Supplies Co.',
      contact_person: 'John Smith',
      email: 'john@techsupplies.com',
      phone: '+1234567890',
      address: '123 Tech Street, Silicon Valley, CA',
    },
    {
      name: 'Fashion Distributors',
      contact_person: 'Maria Garcia',
      email: 'maria@fashiondist.com',
      phone: '+1234567891',
      address: '456 Fashion Ave, New York, NY',
    },
    {
      name: 'Home Essentials Ltd',
      contact_person: 'Robert Johnson',
      email: 'robert@homeessentials.com',
      phone: '+1234567892',
      address: '789 Home Road, Chicago, IL',
    },
    {
      name: 'Book Publishers Inc',
      contact_person: 'Emily Chen',
      email: 'emily@bookpubs.com',
      phone: '+1234567893',
      address: '321 Book Lane, Boston, MA',
    },
    {
      name: 'Outdoor Gear Supply',
      contact_person: 'Michael Brown',
      email: 'michael@outdoorgear.com',
      phone: '+1234567894',
      address: '654 Outdoor Blvd, Denver, CO',
    },
  ];

  for (const supplier of suppliers) {
    const newSupplier = supplierRepository.create(supplier);
    await supplierRepository.save(newSupplier);
    console.log(`Created supplier: ${supplier.name}`);
  }
};
