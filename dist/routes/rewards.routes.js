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
const express = __importStar(require("express"));
const express_validator_1 = require("express-validator");
const validate_request_1 = require("../middleware/validate-request");
const reward_model_1 = require("../models/reward.model");
const customer_model_1 = require("../models/customer.model");
const points_transaction_model_1 = require("../models/points-transaction.model");
const router = express.Router();
const rewardValidation = [
    (0, express_validator_1.body)('title').trim().notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('description').trim().notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('pointsCost').isInt({ min: 0 }).withMessage('Points cost must be a non-negative number'),
    (0, express_validator_1.body)('category')
        .isIn(['discount', 'product', 'experience', 'membership'])
        .withMessage('Invalid category'),
    (0, express_validator_1.body)('available').isBoolean().withMessage('Available must be a boolean'),
    (0, express_validator_1.body)('validFrom').optional().isISO8601().withMessage('Invalid date format'),
    (0, express_validator_1.body)('validUntil').optional().isISO8601().withMessage('Invalid date format'),
    (0, express_validator_1.body)('maxRedemptions').optional().isInt({ min: 0 }).withMessage('Max redemptions must be non-negative'),
];
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const category = req.query.category;
        const available = req.query.available === 'true';
        const query = {};
        if (category) {
            query.category = category;
        }
        if (available) {
            query.available = true;
            query.validFrom = { $lte: new Date() };
            query.validUntil = { $gte: new Date() };
            query.$or = [
                { maxRedemptions: { $exists: false } },
                { currentRedemptions: { $lt: '$maxRedemptions' } },
            ];
        }
        const rewards = await reward_model_1.Reward.find(query)
            .sort({ pointsCost: 1 })
            .skip((page - 1) * limit)
            .limit(limit);
        const total = await reward_model_1.Reward.countDocuments(query);
        res.json({
            rewards,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching rewards', error });
    }
});
router.post('/', rewardValidation, validate_request_1.validateRequest, async (req, res) => {
    try {
        const reward = new reward_model_1.Reward(req.body);
        await reward.save();
        res.status(201).json(reward);
    }
    catch (error) {
        res.status(400).json({ message: 'Error creating reward', error });
    }
});
router.post('/:id/redeem', async (req, res) => {
    try {
        const { id } = req.params;
        const { customerId } = req.body;
        const [reward, customer] = await Promise.all([
            reward_model_1.Reward.findById(id),
            customer_model_1.Customer.findById(customerId),
        ]);
        if (!reward || !customer) {
            return res.status(404).json({ message: 'Reward or customer not found' });
        }
        if (!reward.available) {
            return res.status(400).json({ message: 'Reward is not available' });
        }
        if (reward.requiredTier && customer.currentTier !== reward.requiredTier) {
            return res.status(400).json({ message: 'Customer tier does not meet requirements' });
        }
        if (customer.totalPoints < reward.pointsCost) {
            return res.status(400).json({ message: 'Insufficient points' });
        }
        const transaction = new points_transaction_model_1.PointsTransaction({
            customer: customerId,
            type: 'spent',
            amount: reward.pointsCost,
            description: `Redeemed reward: ${reward.title}`,
            source: 'reward_redemption',
        });
        reward.currentRedemptions += 1;
        if (reward.maxRedemptions && reward.currentRedemptions >= reward.maxRedemptions) {
            reward.available = false;
        }
        await Promise.all([
            transaction.save(),
            reward.save(),
            customer_model_1.Customer.findByIdAndUpdate(customerId, {
                $inc: { totalPoints: -reward.pointsCost },
                $set: { lastActivity: new Date() },
            }),
        ]);
        res.json({ message: 'Reward redeemed successfully', transaction });
    }
    catch (error) {
        res.status(500).json({ message: 'Error redeeming reward', error });
    }
});
router.put('/:id', rewardValidation, validate_request_1.validateRequest, async (req, res) => {
    try {
        const reward = await reward_model_1.Reward.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!reward) {
            return res.status(404).json({ message: 'Reward not found' });
        }
        res.json(reward);
    }
    catch (error) {
        res.status(400).json({ message: 'Error updating reward', error });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const reward = await reward_model_1.Reward.findByIdAndDelete(req.params.id);
        if (!reward) {
            return res.status(404).json({ message: 'Reward not found' });
        }
        res.json({ message: 'Reward deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting reward', error });
    }
});
exports.default = router;
//# sourceMappingURL=rewards.routes.js.map