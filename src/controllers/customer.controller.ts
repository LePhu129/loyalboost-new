import { Request, Response } from 'express';
import { Customer, ICustomer } from '../models/customer.model';

export const customerController = {
  // Get all customers with pagination
  async getAllCustomers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const query: any = {};
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      const total = await Customer.countDocuments(query);
      const customers = await Customer.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      res.json({
        customers,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching customers', error });
    }
  },

  // Get customer by ID
  async getCustomerById(req: Request, res: Response) {
    try {
      const customer = await Customer.findById(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching customer', error });
    }
  },

  // Create new customer
  async createCustomer(req: Request, res: Response) {
    try {
      const customerData: ICustomer = req.body;
      const customer = new Customer(customerData);
      await customer.save();
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ message: 'Error creating customer', error });
    }
  },

  // Update customer
  async updateCustomer(req: Request, res: Response) {
    try {
      const customer = await Customer.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      );
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      res.json(customer);
    } catch (error) {
      res.status(400).json({ message: 'Error updating customer', error });
    }
  },

  // Delete customer
  async deleteCustomer(req: Request, res: Response) {
    try {
      const customer = await Customer.findByIdAndDelete(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting customer', error });
    }
  },

  // Get customer statistics
  async getCustomerStats(req: Request, res: Response) {
    try {
      const totalCustomers = await Customer.countDocuments();
      const tierCounts = await Customer.aggregate([
        {
          $group: {
            _id: '$currentTier',
            count: { $sum: 1 },
          },
        },
      ]);

      const stats = {
        totalCustomers,
        tierDistribution: tierCounts.reduce((acc: any, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching customer statistics', error });
    }
  },
}; 