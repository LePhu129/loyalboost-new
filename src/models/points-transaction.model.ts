import mongoose from 'mongoose';
import { ICustomer } from './customer.model';

export interface IPointsTransaction {
  customer: mongoose.Types.ObjectId | ICustomer;
  type: 'earned' | 'spent';
  amount: number;
  description: string;
  source: 'purchase' | 'reward_redemption' | 'bonus' | 'referral' | 'other';
  metadata?: Record<string, any>;
  expiryDate?: Date;
}

const pointsTransactionSchema = new mongoose.Schema<IPointsTransaction>(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    type: {
      type: String,
      enum: ['earned', 'spent'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      enum: ['purchase', 'reward_redemption', 'bonus', 'referral', 'other'],
      required: true,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    expiryDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying transactions by customer and date range
pointsTransactionSchema.index({ customer: 1, createdAt: -1 });

export const PointsTransaction = mongoose.model<IPointsTransaction>('PointsTransaction', pointsTransactionSchema); 