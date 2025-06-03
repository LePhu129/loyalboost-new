import mongoose from 'mongoose';
import { Customer } from './models/Customer';
import dotenv from 'dotenv';

dotenv.config();

async function listCustomers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/loyalboost');
    console.log('Connected to MongoDB');

    const customers = await Customer.find({});
    console.log('Total customers found:', customers.length);
    console.log('Customers:');
    customers.forEach(customer => {
      console.log(`
        Name: ${customer.firstName} ${customer.lastName}
        Email: ${customer.email}
        Barcode: ${customer.barcode}
        Points: ${customer.totalPoints}
        Tier: ${customer.membershipTier}
        Created: ${customer.createdAt}
        -------------------
      `);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

listCustomers(); 