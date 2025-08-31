import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '../.env');
console.log('Loading environment variables from:', envPath);
dotenv.config({ path: envPath });

console.log('JWT_SECRET in test setup:', process.env.JWT_SECRET);
