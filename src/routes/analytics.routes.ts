import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
const analyticsController = new AnalyticsController();

// Protect all analytics routes with authentication
router.use(authenticateJWT);

// Customer growth analytics
router.get('/customer-growth', analyticsController.getCustomerGrowth);

// Points distribution analytics
router.get('/points-distribution', analyticsController.getPointsDistribution);

// Reward redemption analytics
router.get('/reward-analytics', analyticsController.getRewardAnalytics);

// Customer engagement metrics
router.get('/engagement-metrics', analyticsController.getEngagementMetrics);

export default router; 