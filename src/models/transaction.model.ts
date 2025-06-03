import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
    customerId: mongoose.Types.ObjectId;
    type: 'earned' | 'spent';
    amount: number;
    description: string;
    rewardId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>({
    customerId: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
        required: [true, 'Customer ID is required']
    },
    type: {
        type: String,
        enum: ['earned', 'spent'],
        required: [true, 'Transaction type is required']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    rewardId: {
        type: Schema.Types.ObjectId,
        ref: 'Reward'
    }
}, {
    timestamps: true
});

// Indexes
transactionSchema.index({ customerId: 1, createdAt: -1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ rewardId: 1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema); 