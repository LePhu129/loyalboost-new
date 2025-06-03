import mongoose from 'mongoose';
import { Customer } from './models/Customer';
import dotenv from 'dotenv';

dotenv.config();

async function createTestCustomer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/loyalboost');

    const testCustomer = new Customer({
      firstName: 'Test',
      lastName: 'Customer',
      email: 'test@example.com',
      password: 'hashedpassword123', // In production, this should be properly hashed
      phoneNumber: '1234567890'
      // barcode will be auto-generated
    });

    const savedCustomer = await testCustomer.save();
    console.log('Test customer created:', savedCustomer);
    console.log('Barcode:', savedCustomer.barcode);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createTestCustomer(); 