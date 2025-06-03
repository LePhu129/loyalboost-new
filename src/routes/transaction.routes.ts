import express from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate-request';
import { Transaction } from '../models/transaction.model';
import { Customer } from '../models/customer.model';
import mongoose from 'mongoose';

const router = express.Router();

// Validation middleware
const createTransactionValidation = [
    body('customerId').isMongoId().withMessage('Valid customer ID is required'),
    body('type').isIn(['earned', 'spent']).withMessage('Transaction type must be either earned or spent'),
    body('amount').isInt({ min: 1 }).withMessage('Amount must be a positive number'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('rewardId').optional().isMongoId().withMessage('Valid reward ID is required if provided')
];

// Create new transaction
router.post('/', createTransactionValidation, validateRequest, async (req: express.Request, res: express.Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { customerId, type, amount, description, rewardId } = req.body;

        // Find customer
        const customer = await Customer.findById(customerId).session(session);
        if (!customer) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Create transaction
        const transaction = new Transaction({
            customerId,
            type,
            amount,
            description,
            rewardId
        });

        // Update customer points
        if (type === 'earned') {
            customer.totalPoints += amount;
        } else {
            if (customer.totalPoints < amount) {
                await session.abortTransaction();
                return res.status(400).json({ message: 'Insufficient points' });
            }
            customer.totalPoints -= amount;
        }

        // Save both transaction and customer
        await transaction.save({ session });
        customer.transactions.push(transaction._id);
        await customer.save({ session });

        await session.commitTransaction();

        res.status(201).json({
            message: 'Transaction created successfully',
            transaction,
            newPointsBalance: customer.totalPoints
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Transaction creation error:', error);
        res.status(500).json({ message: 'Error creating transaction', error: error.message });
    } finally {
        session.endSession();
    }
});

// Get customer transactions
router.get('/customer/:customerId', async (req: express.Request, res: express.Response) => {
    try {
        const { customerId } = req.params;
        const { limit = 10, page = 1, type } = req.query;

        const query: any = { customerId };
        if (type && ['earned', 'spent'].includes(type as string)) {
            query.type = type;
        }

        const skip = (Number(page) - 1) * Number(limit);

        const transactions = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate('rewardId', 'title description');

        const total = await Transaction.countDocuments(query);

        res.json({
            transactions,
            pagination: {
                total,
                pages: Math.ceil(total / Number(limit)),
                currentPage: Number(page),
                limit: Number(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Error fetching transactions', error: error.message });
    }
});

// Get transaction by ID
router.get('/:id', async (req: express.Request, res: express.Response) => {
    try {
        const transaction = await Transaction.findById(req.params.id)
            .populate('customerId', 'firstName lastName email')
            .populate('rewardId', 'title description');

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.json(transaction);
    } catch (error) {
        console.error('Error fetching transaction:', error);
        res.status(500).json({ message: 'Error fetching transaction', error: error.message });
    }
});

// Get transaction summary
router.get('/summary/customer/:customerId', async (req: express.Request, res: express.Response) => {
    try {
        const { customerId } = req.params;
        const { startDate, endDate } = req.query;

        const query: any = { customerId };
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate as string);
            if (endDate) query.createdAt.$lte = new Date(endDate as string);
        }

        const summary = await Transaction.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$type',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        type TransactionType = 'earned' | 'spent';
        type SummaryResult = {
            [K in TransactionType]: {
                amount: number;
                count: number;
            }
        };

        const result: SummaryResult = {
            earned: { amount: 0, count: 0 },
            spent: { amount: 0, count: 0 }
        };

        summary.forEach((item) => {
            const type = item._id as TransactionType;
            result[type] = {
                amount: item.totalAmount,
                count: item.count
            };
        });

        res.json(result);
    } catch (error) {
        console.error('Error fetching transaction summary:', error);
        res.status(500).json({ message: 'Error fetching transaction summary', error: error.message });
    }
});

export default router; 