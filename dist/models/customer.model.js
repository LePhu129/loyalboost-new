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
exports.Customer = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const customerSchema = new mongoose_1.Schema({
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
            validator: function (v) {
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
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Transaction'
        }]
}, {
    timestamps: true
});
customerSchema.index({ email: 1 });
customerSchema.index({ totalPoints: -1 });
customerSchema.index({ currentTier: 1 });
customerSchema.methods.updateTier = function () {
    const points = this.totalPoints;
    if (points >= 10000) {
        this.currentTier = 'platinum';
    }
    else if (points >= 5000) {
        this.currentTier = 'gold';
    }
    else if (points >= 1000) {
        this.currentTier = 'silver';
    }
    else {
        this.currentTier = 'bronze';
    }
};
customerSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});
customerSchema.pre('save', function (next) {
    if (this.isModified('totalPoints')) {
        this.updateTier();
    }
    next();
});
exports.Customer = mongoose_1.default.model('Customer', customerSchema);
//# sourceMappingURL=customer.model.js.map