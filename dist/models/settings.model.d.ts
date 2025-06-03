import mongoose from 'mongoose';
export interface IProgramSettings {
    pointsPerDollar: number;
    minimumPurchase: number;
    pointsExpiry: number;
    tiers: {
        silver: number;
        gold: number;
        platinum: number;
    };
    notifications: {
        pointsEarned: boolean;
        pointsExpiring: boolean;
        tierChange: boolean;
        specialOffers: boolean;
    };
}
export declare const Settings: mongoose.Model<IProgramSettings, {}, {}, {}, mongoose.Document<unknown, {}, IProgramSettings> & IProgramSettings & {
    _id: mongoose.Types.ObjectId;
}, any>;
