import mongoose, { Document, Schema } from 'mongoose';

type TierLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

// Reward interface
export interface IReward extends Document {
    title: string;
    description: string;
    pointsCost: number;
    isActive: boolean;
    expiryDate?: Date;
    tierRequirement?: TierLevel;
    maxRedemptions?: number;
    currentRedemptions: number;
    createdAt: Date;
    updatedAt: Date;
    isAvailable: boolean;
    canBeRedeemedBy(customer: { totalPoints: number; currentTier: TierLevel }): boolean;
}

// Reward schema
const rewardSchema = new Schema<IReward>({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    pointsCost: {
        type: Number,
        required: [true, 'Points cost is required'],
        min: [0, 'Points cost cannot be negative']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiryDate: {
        type: Date,
        validate: {
            validator: function(v: Date) {
                return !v || v > new Date();
            },
            message: 'Expiry date must be in the future'
        }
    },
    tierRequirement: {
        type: String,
        enum: ['bronze', 'silver', 'gold', 'platinum']
    },
    maxRedemptions: {
        type: Number,
        min: [0, 'Maximum redemptions cannot be negative']
    },
    currentRedemptions: {
        type: Number,
        default: 0,
        min: [0, 'Current redemptions cannot be negative']
    }
}, {
    timestamps: true
});

// Indexes
rewardSchema.index({ pointsCost: 1 });
rewardSchema.index({ isActive: 1 });
rewardSchema.index({ expiryDate: 1 });
rewardSchema.index({ tierRequirement: 1 });

// Virtual for availability status
rewardSchema.virtual('isAvailable').get(function(this: IReward): boolean {
    const now = new Date();
    const isExpired = this.expiryDate && this.expiryDate < now;
    const isMaxedOut = this.maxRedemptions && this.currentRedemptions >= this.maxRedemptions;
    
    return this.isActive && !isExpired && !isMaxedOut;
});

// Methods
rewardSchema.methods.canBeRedeemedBy = function(
    this: IReward,
    customer: { totalPoints: number; currentTier: TierLevel }
): boolean {
    if (!this.isAvailable) return false;
    
    // Check points requirement
    if (customer.totalPoints < this.pointsCost) return false;
    
    // Check tier requirement
    if (this.tierRequirement) {
        const tierLevels: Record<TierLevel, number> = {
            bronze: 0,
            silver: 1,
            gold: 2,
            platinum: 3
        };
        
        const requiredLevel = tierLevels[this.tierRequirement];
        const customerLevel = tierLevels[customer.currentTier];
        
        if (customerLevel < requiredLevel) return false;
    }
    
    return true;
};

// Pre-save middleware
rewardSchema.pre('save', function(next) {
    // Ensure currentRedemptions doesn't exceed maxRedemptions
    if (this.maxRedemptions && this.currentRedemptions > this.maxRedemptions) {
        this.currentRedemptions = this.maxRedemptions;
    }
    next();
});

export const Reward = mongoose.model<IReward>('Reward', rewardSchema); 