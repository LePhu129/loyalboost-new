import * as express from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate-request';
import { PointsTransaction } from '../models/points-transaction.model';
import { Customer } from '../models/customer.model';
import { Router } from 'express';
import { addPointsByBarcode } from '../controllers/points.controller';

const router = express.Router();

// Validation middleware
const pointsTransactionValidation = [
  body('customer').isMongoId().withMessage('Valid customer ID is required'),
  body('type').isIn(['earned', 'spent']).withMessage('Type must be either earned or spent'),
  body('amount').isInt({ min: 1 }).withMessage('Amount must be a positive number'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('source')
    .isIn(['purchase', 'reward_redemption', 'bonus', 'referral', 'other'])
    .withMessage('Invalid source'),
];

// Validate barcode points request
const validateBarcodePoints = [
  body('barcode')
    .isString()
    .isLength({ min: 12, max: 12 })
    .withMessage('Valid barcode is required'),
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .custom((value) => value > 0)
    .withMessage('Amount must be greater than 0'),
];

// Routes
router.get('/customer/:customerId', async (req: express.Request, res: express.Response) => {
  try {
    const { customerId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const transactions = await PointsTransaction.find({ customer: customerId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('customer', 'firstName lastName email');

    const total = await PointsTransaction.countDocuments({ customer: customerId });

    res.json({
      transactions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error });
  }
});

router.post('/', pointsTransactionValidation, validateRequest, async (req: express.Request, res: express.Response) => {
  try {
    const transaction = new PointsTransaction(req.body);
    await transaction.save();

    // Update customer's total points
    const pointsChange = transaction.type === 'earned' ? transaction.amount : -transaction.amount;
    await Customer.findByIdAndUpdate(transaction.customer, {
      $inc: { totalPoints: pointsChange },
      $set: { lastActivity: new Date() },
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: 'Error creating transaction', error });
  }
});

router.get('/expiring', async (req: express.Request, res: express.Response) => {
  try {
    const { days = 30 } = req.query;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(days as string));

    const expiringPoints = await PointsTransaction.find({
      expiryDate: { $lte: expiryDate },
      type: 'earned',
    })
      .populate('customer', 'firstName lastName email')
      .sort({ expiryDate: 1 });

    res.json(expiringPoints);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expiring points', error });
  }
});

router.get('/summary', async (req: express.Request, res: express.Response) => {
  try {
    const { startDate, endDate } = req.query;
    const query: any = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    const summary = await PointsTransaction.aggregate([
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
  } catch (error) {
    res.status(500).json({ message: 'Error fetching points summary', error });
  }
});

// Add points by barcode
router.post('/barcode', validateBarcodePoints, validateRequest, addPointsByBarcode);

export default router; 