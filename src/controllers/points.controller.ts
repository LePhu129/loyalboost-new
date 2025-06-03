import { Request, Response } from 'express';
import { Customer } from '../models/Customer';

export const addPointsByBarcode = async (req: Request, res: Response) => {
  try {
    const { barcode, amount } = req.body;

    if (!barcode || !amount) {
      return res.status(400).json({
        error: 'Barcode and amount are required'
      });
    }

    // Find customer by barcode
    const customer = await Customer.findOne({ barcode });
    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }

    // Add points
    customer.totalPoints += Number(amount);

    // Update membership tier based on total points
    if (customer.totalPoints >= 25000) {
      customer.membershipTier = 'Platinum';
    } else if (customer.totalPoints >= 10000) {
      customer.membershipTier = 'Gold';
    } else if (customer.totalPoints >= 5000) {
      customer.membershipTier = 'Silver';
    }

    await customer.save();

    return res.json({
      success: true,
      customer: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        totalPoints: customer.totalPoints,
        membershipTier: customer.membershipTier
      }
    });
  } catch (error) {
    console.error('Error adding points:', error);
    return res.status(500).json({
      error: 'Failed to add points'
    });
  }
}; 