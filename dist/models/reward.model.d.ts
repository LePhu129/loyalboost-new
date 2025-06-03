import mongoose from 'mongoose';
export interface IReward {
    title: string;
    description: string;
    pointsCost: number;
    category: 'discount' | 'product' | 'experience' | 'membership';
    imageUrl?: string;
    available: boolean;
    validFrom?: Date;
    validUntil?: Date;
    termsAndConditions?: string;
    maxRedemptions?: number;
    currentRedemptions: number;
    requiredTier?: 'bronze' | 'silver' | 'gold' | 'platinum';
}
export declare const Reward: mongoose.Model<IReward, {}, {}, {}, mongoose.Document<unknown, {}, IReward> & IReward & {
    _id: mongoose.Types.ObjectId;
}, any>;
