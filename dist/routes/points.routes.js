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
const points_transaction_model_1 = require("../models/points-transaction.model");
const customer_model_1 = require("../models/customer.model");
const router = express.Router();
const pointsTransactionValidation = [
    (0, express_validator_1.body)('customer').isMongoId().withMessage('Valid customer ID is required'),
    (0, express_validator_1.body)('type').isIn(['earned', 'spent']).withMessage('Type must be either earned or spent'),
    (0, express_validator_1.body)('amount').isInt({ min: 1 }).withMessage('Amount must be a positive number'),
    (0, express_validator_1.body)('description').trim().notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('source')
        .isIn(['purchase', 'reward_redemption', 'bonus', 'referral', 'other'])
        .withMessage('Invalid source'),
];
router.get('/customer/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const transactions = await points_transaction_model_1.PointsTransaction.find({ customer: customerId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('customer', 'firstName lastName email');
        const total = await points_transaction_model_1.PointsTransaction.countDocuments({ customer: customerId });
        res.json({
            transactions,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching transactions', error });
    }
});
router.post('/', pointsTransactionValidation, validate_request_1.validateRequest, async (req, res) => {
    try {
        const transaction = new points_transaction_model_1.PointsTransaction(req.body);
        await transaction.save();
        const pointsChange = transaction.type === 'earned' ? transaction.amount : -transaction.amount;
        await customer_model_1.Customer.findByIdAndUpdate(transaction.customer, {
            $inc: { totalPoints: pointsChange },
            $set: { lastActivity: new Date() },
        });
        res.status(201).json(transaction);
    }
    catch (error) {
        res.status(400).json({ message: 'Error creating transaction', error });
    }
});
router.get('/expiring', async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + parseInt(days));
        const expiringPoints = await points_transaction_model_1.PointsTransaction.find({
            expiryDate: { $lte: expiryDate },
            type: 'earned',
        })
            .populate('customer', 'firstName lastName email')
            .sort({ expiryDate: 1 });
        res.json(expiringPoints);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching expiring points', error });
    }
});
router.get('/summary', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = {};
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }
        const summary = await points_transaction_model_1.PointsTransaction.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$type',
                    totalPoints: { $sum: '$amount' },
                    count: { $sum: 1 },
                },
            },
        ]);
        res.json(summary);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching points summary', error });
    }
});
exports.default = router;
//# sourceMappingURL=points.routes.js.map