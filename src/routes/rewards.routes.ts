import * as express from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate-request';
import { Reward } from '../models/reward.model';
import { Customer } from '../models/customer.model';
import { PointsTransaction } from '../models/points-transaction.model';

const router = express.Router();

// Validation middleware
const rewardValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('pointsCost').isInt({ min: 0 }).withMessage('Points cost must be a non-negative number'),
  body('category')
    .isIn(['discount', 'product', 'experience', 'membership'])
    .withMessage('Invalid category'),
  body('available').isBoolean().withMessage('Available must be a boolean'),
  body('validFrom').optional().isISO8601().withMessage('Invalid date format'),
  body('validUntil').optional().isISO8601().withMessage('Invalid date format'),
  body('maxRedemptions').optional().isInt({ min: 0 }).withMessage('Max redemptions must be non-negative'),
];

// Routes
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;
    const available = req.query.available === 'true';

    const query: any = {};
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

    const rewards = await Reward.find(query)
      .sort({ pointsCost: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Reward.countDocuments(query);

    res.json({
      rewards,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rewards', error });
  }
});

router.post('/', rewardValidation, validateRequest, async (req: express.Request, res: express.Response) => {
  try {
    const reward = new Reward(req.body);
    await reward.save();
    res.status(201).json(reward);
  } catch (error) {
    res.status(400).json({ message: 'Error creating reward', error });
  }
});

router.post('/:id/redeem', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const { customerId } = req.body;

    const [reward, customer] = await Promise.all([
      Reward.findById(id),
      Customer.findById(customerId),
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

    // Create points transaction
    const transaction = new PointsTransaction({
      customer: customerId,
      type: 'spent',
      amount: reward.pointsCost,
      description: `Redeemed reward: ${reward.title}`,
      source: 'reward_redemption',
    });

    // Update reward redemption count
    reward.currentRedemptions += 1;
    if (reward.maxRedemptions && reward.currentRedemptions >= reward.maxRedemptions) {
      reward.available = false;
    }

    // Save all changes
    await Promise.all([
      transaction.save(),
      reward.save(),
      Customer.findByIdAndUpdate(customerId, {
        $inc: { totalPoints: -reward.pointsCost },
        $set: { lastActivity: new Date() },
      }),
    ]);

    res.json({ message: 'Reward redeemed successfully', transaction });
  } catch (error) {
    res.status(500).json({ message: 'Error redeeming reward', error });
  }
});

router.put('/:id', rewardValidation, validateRequest, async (req: express.Request, res: express.Response) => {
  try {
    const reward = await Reward.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' });
    }
    res.json(reward);
  } catch (error) {
    res.status(400).json({ message: 'Error updating reward', error });
  }
});

router.delete('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const reward = await Reward.findByIdAndDelete(req.params.id);
    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' });
    }
    res.json({ message: 'Reward deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting reward', error });
  }
});

export default router; 