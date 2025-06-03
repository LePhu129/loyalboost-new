import express from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate-request';
import { customerController } from '../controllers/customer.controller';

const router = express.Router();

// Validation middleware
const customerValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
];

// Routes
router.get('/', customerController.getAllCustomers);
router.get('/stats', customerController.getCustomerStats);
router.get('/:id', customerController.getCustomerById);
router.post('/', customerValidation, validateRequest, customerController.createCustomer);
router.put('/:id', customerValidation, validateRequest, customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

export default router; 