"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointsTransaction = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const pointsTransactionSchema = new mongoose_1.default.Schema({
    customer: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    type: {
        type: String,
        enum: ['earned', 'spent'],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    source: {
        type: String,
        enum: ['purchase', 'reward_redemption', 'bonus', 'referral', 'other'],
        required: true,
    },
    metadata: {
        type: Map,
        of: mongoose_1.default.Schema.Types.Mixed,
    },
    expiryDate: {
        type: Date,
    },
}, {
    timestamps: true,
});
pointsTransactionSchema.index({ customer: 1, createdAt: -1 });
exports.PointsTransaction = mongoose_1.default.model('PointsTransaction', pointsTransactionSchema);
//# sourceMappingURL=points-transaction.model.js.map