import mongoose from 'mongoose';

export interface IProgramSettings {
  pointsPerDollar: number;
  minimumPurchase: number;
  pointsExpiry: number; // in days
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

const settingsSchema = new mongoose.Schema<IProgramSettings>(
  {
    pointsPerDollar: {
      type: Number,
      required: true,
      min: 0,
      default: 10,
    },
    minimumPurchase: {
      type: Number,
      required: true,
      min: 0,
      default: 5,
    },
    pointsExpiry: {
      type: Number,
      required: true,
      min: 0,
      default: 365,
    },
    tiers: {
      silver: {
        type: Number,
        required: true,
        default: 1000,
      },
      gold: {
        type: Number,
        required: true,
        default: 5000,
      },
      platinum: {
        type: Number,
        required: true,
        default: 10000,
      },
    },
    notifications: {
      pointsEarned: {
        type: Boolean,
        default: true,
      },
      pointsExpiring: {
        type: Boolean,
        default: true,
      },
      tierChange: {
        type: Boolean,
        default: true,
      },
      specialOffers: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Settings = mongoose.model<IProgramSettings>('Settings', settingsSchema); 