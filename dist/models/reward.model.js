"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reward = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const rewardSchema = new mongoose_1.Schema({
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
            validator: function (v) {
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
rewardSchema.index({ pointsCost: 1 });
rewardSchema.index({ isActive: 1 });
rewardSchema.index({ expiryDate: 1 });
rewardSchema.index({ tierRequirement: 1 });
rewardSchema.virtual('isAvailable').get(function () {
    const now = new Date();
    const isExpired = this.expiryDate && this.expiryDate < now;
    const isMaxedOut = this.maxRedemptions && this.currentRedemptions >= this.maxRedemptions;
    return this.isActive && !isExpired && !isMaxedOut;
});
rewardSchema.methods.canBeRedeemedBy = function (customer) {
    if (!this.isAvailable)
        return false;
    if (customer.totalPoints < this.pointsCost)
        return false;
    if (this.tierRequirement) {
        const tierLevels = {
            bronze: 0,
            silver: 1,
            gold: 2,
            platinum: 3
        };
        const requiredLevel = tierLevels[this.tierRequirement];
        const customerLevel = tierLevels[customer.currentTier];
        if (customerLevel < requiredLevel)
            return false;
    }
    return true;
};
rewardSchema.pre('save', function (next) {
    if (this.maxRedemptions && this.currentRedemptions > this.maxRedemptions) {
        this.currentRedemptions = this.maxRedemptions;
    }
    next();
});
exports.Reward = mongoose_1.default.model('Reward', rewardSchema);
//# sourceMappingURL=reward.model.js.map