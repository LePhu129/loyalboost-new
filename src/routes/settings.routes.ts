import * as express from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate-request';
import { Settings, IProgramSettings } from '../models/settings.model';

const router = express.Router();

// Validation middleware
const settingsValidation = [
  body('pointsPerDollar').isInt({ min: 0 }).withMessage('Points per dollar must be non-negative'),
  body('minimumPurchase').isInt({ min: 0 }).withMessage('Minimum purchase must be non-negative'),
  body('pointsExpiry').isInt({ min: 0 }).withMessage('Points expiry must be non-negative'),
  body('tiers.silver').isInt({ min: 0 }).withMessage('Silver tier threshold must be non-negative'),
  body('tiers.gold').isInt({ min: 0 }).withMessage('Gold tier threshold must be non-negative'),
  body('tiers.platinum').isInt({ min: 0 }).withMessage('Platinum tier threshold must be non-negative'),
  body('notifications.pointsEarned').isBoolean(),
  body('notifications.pointsExpiring').isBoolean(),
  body('notifications.tierChange').isBoolean(),
  body('notifications.specialOffers').isBoolean(),
];

// Routes
router.get('/', async (_req: express.Request, res: express.Response) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = new Settings({});
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error });
  }
});

router.put('/', settingsValidation, validateRequest, async (req: express.Request, res: express.Response) => {
  try {
    const updates: Partial<IProgramSettings> = req.body;
    
    // Ensure tier thresholds are in ascending order
    if (updates.tiers) {
      if (updates.tiers.gold <= updates.tiers.silver) {
        return res.status(400).json({
          message: 'Gold tier threshold must be greater than Silver tier threshold',
        });
      }
      if (updates.tiers.platinum <= updates.tiers.gold) {
        return res.status(400).json({
          message: 'Platinum tier threshold must be greater than Gold tier threshold',
        });
      }
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(updates);
    } else {
      Object.assign(settings, updates);
    }

    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: 'Error updating settings', error });
  }
});

// Get tier requirements
router.get('/tiers', async (_req: express.Request, res: express.Response) => {
  try {
    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    res.json(settings.tiers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tier settings', error });
  }
});

// Get notification settings
router.get('/notifications', async (_req: express.Request, res: express.Response) => {
  try {
    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    res.json(settings.notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notification settings', error });
  }
});

export default router; 