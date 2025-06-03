"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerController = void 0;
const customer_model_1 = require("../models/customer.model");
exports.customerController = {
    async getAllCustomers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search;
            const query = {};
            if (search) {
                query.$or = [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                ];
            }
            const total = await customer_model_1.Customer.countDocuments(query);
            const customers = await customer_model_1.Customer.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);
            res.json({
                customers,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            });
        }
        catch (error) {
            res.status(500).json({ message: 'Error fetching customers', error });
        }
    },
    async getCustomerById(req, res) {
        try {
            const customer = await customer_model_1.Customer.findById(req.params.id);
            if (!customer) {
                return res.status(404).json({ message: 'Customer not found' });
            }
            res.json(customer);
        }
        catch (error) {
            res.status(500).json({ message: 'Error fetching customer', error });
        }
    },
    async createCustomer(req, res) {
        try {
            const customerData = req.body;
            const customer = new customer_model_1.Customer(customerData);
            await customer.save();
            res.status(201).json(customer);
        }
        catch (error) {
            res.status(400).json({ message: 'Error creating customer', error });
        }
    },
    async updateCustomer(req, res) {
        try {
            const customer = await customer_model_1.Customer.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
            if (!customer) {
                return res.status(404).json({ message: 'Customer not found' });
            }
            res.json(customer);
        }
        catch (error) {
            res.status(400).json({ message: 'Error updating customer', error });
        }
    },
    async deleteCustomer(req, res) {
        try {
            const customer = await customer_model_1.Customer.findByIdAndDelete(req.params.id);
            if (!customer) {
                return res.status(404).json({ message: 'Customer not found' });
            }
            res.json({ message: 'Customer deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ message: 'Error deleting customer', error });
        }
    },
    async getCustomerStats(req, res) {
        try {
            const totalCustomers = await customer_model_1.Customer.countDocuments();
            const tierCounts = await customer_model_1.Customer.aggregate([
                {
                    $group: {
                        _id: '$currentTier',
                        count: { $sum: 1 },
                    },
                },
            ]);
            const stats = {
                totalCustomers,
                tierDistribution: tierCounts.reduce((acc, curr) => {
                    acc[curr._id] = curr.count;
                    return acc;
                }, {}),
            };
            res.json(stats);
        }
        catch (error) {
            res.status(500).json({ message: 'Error fetching customer statistics', error });
        }
    },
};
//# sourceMappingURL=customer.controller.js.map