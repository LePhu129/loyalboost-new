import mongoose from 'mongoose';
export interface ICustomer {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    totalPoints: number;
    currentTier: 'bronze' | 'silver' | 'gold' | 'platinum';
    joinDate: Date;
    lastActivity: Date;
}
export declare const Customer: mongoose.Model<ICustomer, {}, {}, {}, mongoose.Document<unknown, {}, ICustomer> & ICustomer & {
    _id: mongoose.Types.ObjectId;
}, any>;
