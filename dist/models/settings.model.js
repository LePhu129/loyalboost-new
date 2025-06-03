"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Settings = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const settingsSchema = new mongoose_1.default.Schema({
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
}, {
    timestamps: true,
});
exports.Settings = mongoose_1.default.model('Settings', settingsSchema);
//# sourceMappingURL=settings.model.js.map