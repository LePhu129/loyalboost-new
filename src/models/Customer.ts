import mongoose, { Document, Schema } from 'mongoose';
import { customAlphabet } from 'nanoid';

// Generate a barcode using nanoid (12 digits)
const generateBarcode = customAlphabet('0123456789', 12);

export interface ICustomer extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  barcode: string;
  membershipTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  totalPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  barcode: {
    type: String,
    required: true,
    unique: true,
    default: () => generateBarcode()
  },
  membershipTier: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
    default: 'Bronze'
  },
  totalPoints: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create index on barcode for faster lookups
CustomerSchema.index({ barcode: 1 });

// Check if the model exists before creating it
export const Customer = mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema); 