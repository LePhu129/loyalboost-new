"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const validate_request_1 = require("../middleware/validate-request");
const transaction_model_1 = require("../models/transaction.model");
const customer_model_1 = require("../models/customer.model");
const mongoose_1 = __importDefault(require("mongoose"));
const router = express_1.default.Router();
const createTransactionValidation = [
    (0, express_validator_1.body)('customerId').isMongoId().withMessage('Valid customer ID is required'),
    (0, express_validator_1.body)('type').isIn(['earned', 'spent']).withMessage('Transaction type must be either earned or spent'),
    (0, express_validator_1.body)('amount').isInt({ min: 1 }).withMessage('Amount must be a positive number'),
    (0, express_validator_1.body)('description').trim().notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('rewardId').optional().isMongoId().withMessage('Valid reward ID is required if provided')
];
router.post('/', createTransactionValidation, validate_request_1.validateRequest, async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { customerId, type, amount, description, rewardId } = req.body;
        const customer = await customer_model_1.Customer.findById(customerId).session(session);
        if (!customer) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Customer not found' });
        }
        const transaction = new transaction_model_1.Transaction({
            customerId,
            type,
            amount,
            description,
            rewardId
        });
        if (type === 'earned') {
            customer.totalPoints += amount;
        }
        else {
            if (customer.totalPoints < amount) {
                await session.abortTransaction();
                return res.status(400).json({ message: 'Insufficient points' });
            }
            customer.totalPoints -= amount;
        }
        await transaction.save({ session });
        customer.transactions.push(transaction._id);
        await customer.save({ session });
        await session.commitTransaction();
        res.status(201).json({
            message: 'Transaction created successfully',
            transaction,
            newPointsBalance: customer.totalPoints
        });
    }
    catch (error) {
        await session.abortTransaction();
        console.error('Transaction creation error:', error);
        res.status(500).json({ message: 'Error creating transaction', error: error.message });
    }
    finally {
        session.endSession();
    }
});
router.get('/customer/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        const { limit = 10, page = 1, type } = req.query;
        const query = { customerId };
        if (type && ['earned', 'spent'].includes(type)) {
            query.type = type;
        }
        const skip = (Number(page) - 1) * Number(limit);
        const transactions = await transaction_model_1.Transaction.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate('rewardId', 'title description');
        const total = await transaction_model_1.Transaction.countDocuments(query);
        res.json({
            transactions,
            pagination: {
                total,
                pages: Math.ceil(total / Number(limit)),
                currentPage: Number(page),
                limit: Number(limit)
            }
        });
    }
    catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Error fetching transactions', error: error.message });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const transaction = await transaction_model_1.Transaction.findById(req.params.id)
            .populate('customerId', 'firstName lastName email')
            .populate('rewardId', 'title description');
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.json(transaction);
    }
    catch (error) {
        console.error('Error fetching transaction:', error);
        res.status(500).json({ message: 'Error fetching transaction', error: error.message });
    }
});
router.get('/summary/customer/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        const { startDate, endDate } = req.query;
        const query = { customerId };
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate)
                query.createdAt.$gte = new Date(startDate);
            if (endDate)
                query.createdAt.$lte = new Date(endDate);
        }
        const summary = await transaction_model_1.Transaction.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$type',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);
        const result = {
            earned: { amount: 0, count: 0 },
            spent: { amount: 0, count: 0 }
        };
        summary.forEach((item) => {
            const type = item._id;
            result[type] = {
                amount: item.totalAmount,
                count: item.count
            };
        });
        res.json(result);
    }
    catch (error) {
        console.error('Error fetching transaction summary:', error);
        res.status(500).json({ message: 'Error fetching transaction summary', error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=transaction.routes.js.map