import express from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validateRequest } from '../middleware/validate-request';
import { Customer } from '../models/customer.model';

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone').optional().isMobilePhone('any').withMessage('Valid phone number is required'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Register new customer
router.post('/register', registerValidation, validateRequest, async (req: express.Request, res: express.Response) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new customer
    const customer = new Customer({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      totalPoints: 0,
      currentTier: 'bronze',
      joinDate: new Date(),
      lastActivity: new Date(),
    });

    await customer.save();

    // Generate JWT token
    const token = jwt.sign(
      { customerId: customer._id },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      customer: {
        id: customer._id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        totalPoints: customer.totalPoints,
        currentTier: customer.currentTier,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering customer', error: error.message });
  }
});

// Login customer
router.post('/login', loginValidation, validateRequest, async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    // Find customer
    const customer = await Customer.findOne({ email });
    if (!customer) {
      console.log('No customer found with email:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, customer.password);
    if (!isValidPassword) {
      console.log('Invalid password for email:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('Login successful for customer:', customer._id);

    // Update last activity
    customer.lastActivity = new Date();
    await customer.save();

    // Generate JWT token
    const token = jwt.sign(
      { customerId: customer._id },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      customer: {
        id: customer._id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        totalPoints: customer.totalPoints,
        currentTier: customer.currentTier,
        joinDate: customer.joinDate
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

export default router; 