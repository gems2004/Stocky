import { DataSource } from 'typeorm';
import { Category } from '../../category/entities/category.entity';

export const seedCategories = async (dataSource: DataSource) => {
  const categoryRepository = dataSource.getRepository(Category);
  
  // Check if categories already exist to avoid duplicates
  const existingCategories = await categoryRepository.find();
  if (existingCategories.length > 0) {
    console.log('Categories already exist, skipping seeding');
    return;
  }
  
  const categories = [
    {
      name: 'Electronics',
      description: 'Electronic devices and accessories',
    },
    {
      name: 'Clothing',
      description: 'Apparel and fashion items',
    },
    {
      name: 'Home & Kitchen',
      description: 'Household items and kitchen appliances',
    },
    {
      name: 'Books',
      description: 'Books and educational materials',
    },
    {
      name: 'Sports & Outdoors',
      description: 'Sports equipment and outdoor gear',
    },
  ];
  
  for (const category of categories) {
    const newCategory = categoryRepository.create(category);
    await categoryRepository.save(newCategory);
    console.log(`Created category: ${category.name}`);
  }
};