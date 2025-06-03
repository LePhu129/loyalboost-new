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
export declare const PointsTransaction: mongoose.Model<IPointsTransaction, {}, {}, {}, mongoose.Document<unknown, {}, IPointsTransaction> & IPointsTransaction & {
    _id: mongoose.Types.ObjectId;
}, any>;
