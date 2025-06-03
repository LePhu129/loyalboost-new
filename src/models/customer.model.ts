import mongoose, { Document, Schema } from 'mongoose';

// Customer interface
export interface ICustomer extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    totalPoints: number;
    currentTier: 'bronze' | 'silver' | 'gold' | 'platinum';
    joinDate: Date;
    lastActivity: Date;
    rewardsRedeemed: number;
    transactions: mongoose.Types.ObjectId[];
    updateTier(): void;
    fullName: string;
}

// Customer schema
const customerSchema = new Schema<ICustomer>({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    phone: {
        type: String,
        trim: true,
        validate: {
            validator: function(v: string) {
                return !v || /^\+?[\d\s-]+$/.test(v);
            },
            message: 'Please enter a valid phone number'
        }
    },
    totalPoints: {
        type: Number,
        default: 0,
        min: [0, 'Total points cannot be negative']
    },
    currentTier: {
        type: String,
        enum: ['bronze', 'silver', 'gold', 'platinum'],
        default: 'bronze'
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    rewardsRedeemed: {
        type: Number,
        default: 0,
        min: [0, 'Rewards redeemed cannot be negative']
    },
    transactions: [{
        type: Schema.Types.ObjectId,
        ref: 'Transaction'
    }]
}, {
    timestamps: true
});

// Indexes
customerSchema.index({ email: 1 });
customerSchema.index({ totalPoints: -1 });
customerSchema.index({ currentTier: 1 });

// Methods
customerSchema.methods.updateTier = function(this: ICustomer): void {
    const points = this.totalPoints;
    if (points >= 10000) {
        this.currentTier = 'platinum';
    } else if (points >= 5000) {
        this.currentTier = 'gold';
    } else if (points >= 1000) {
        this.currentTier = 'silver';
    } else {
        this.currentTier = 'bronze';
    }
};

// Virtual for full name
customerSchema.virtual('fullName').get(function(this: ICustomer): string {
    return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to update tier
customerSchema.pre('save', function(next) {
    if (this.isModified('totalPoints')) {
        this.updateTier();
    }
    next();
});

export const Customer = mongoose.model<ICustomer>('Customer', customerSchema); 