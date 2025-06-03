import { Request, Response } from 'express';
import { Customer } from '../models/customer.model';
import { Transaction } from '../models/transaction.model';
import { PointsTransaction } from '../models/points-transaction.model';
import { Reward } from '../models/reward.model';

interface CustomerDocument {
  createdAt: Date;
}

interface TransactionDocument {
  rewardId: {
    toString: () => string;
    name: string;
  };
  pointsSpent: number;
}

interface PointsTransactionDocument {
  points: number;
  customerId: {
    toString: () => string;
  };
}

export class AnalyticsController {
  // Get customer growth over time
  async getCustomerGrowth(req: Request, res: Response) {
    try {
      const timeframe = req.query.timeframe || 'month'; // 'week', 'month', 'year'
      const now = new Date();
      const startDate = new Date();
      
      switch(timeframe) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      const customers = await Customer.find({
        createdAt: { $gte: startDate, $lte: now }
      }).select('createdAt');

      const growth = customers.reduce((acc: { [key: string]: number }, customer: CustomerDocument) => {
        const date = customer.createdAt.toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      res.json({ success: true, data: growth });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch customer growth data' });
    }
  }

  // Get points distribution statistics
  async getPointsDistribution(req: Request, res: Response) {
    try {
      const result = await Customer.aggregate([
        {
          $group: {
            _id: null,
            averagePoints: { $avg: '$points' },
            maxPoints: { $max: '$points' },
            minPoints: { $min: '$points' },
            totalPoints: { $sum: '$points' }
          }
        }
      ]);

      const distribution = await Customer.aggregate([
        {
          $bucket: {
            groupBy: '$points',
            boundaries: [0, 100, 500, 1000, 5000, Infinity],
            default: 'Other',
            output: {
              count: { $sum: 1 },
              customers: { $push: { id: '$_id', points: '$points' } }
            }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          statistics: result[0],
          distribution
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch points distribution data' });
    }
  }

  // Get reward redemption analytics
  async getRewardAnalytics(req: Request, res: Response) {
    try {
      const timeframe = req.query.timeframe || 'month';
      const now = new Date();
      const startDate = new Date();
      
      switch(timeframe) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      const redemptions = await Transaction.find({
        type: 'REDEMPTION',
        createdAt: { $gte: startDate, $lte: now }
      }).populate('rewardId');

      const rewardStats = redemptions.reduce((acc: { [key: string]: any }, transaction: TransactionDocument) => {
        const rewardId = transaction.rewardId.toString();
        if (!acc[rewardId]) {
          acc[rewardId] = {
            count: 0,
            pointsSpent: 0,
            name: transaction.rewardId.name
          };
        }
        acc[rewardId].count += 1;
        acc[rewardId].pointsSpent += transaction.pointsSpent;
        return acc;
      }, {});

      res.json({ success: true, data: rewardStats });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch reward analytics data' });
    }
  }

  // Get customer engagement metrics
  async getEngagementMetrics(req: Request, res: Response) {
    try {
      const timeframe = req.query.timeframe || 'month';
      const now = new Date();
      const startDate = new Date();
      
      switch(timeframe) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      const transactions = await PointsTransaction.find({
        createdAt: { $gte: startDate, $lte: now }
      });

      const metrics = {
        totalTransactions: transactions.length,
        averageTransactionValue: transactions.reduce((acc: number, curr: PointsTransactionDocument) => acc + curr.points, 0) / transactions.length,
        activeCustomers: new Set(transactions.map((t: PointsTransactionDocument) => t.customerId.toString())).size
      };

      res.json({ success: true, data: metrics });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch engagement metrics' });
    }
  }
} 