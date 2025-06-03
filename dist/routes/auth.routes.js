"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validate_request_1 = require("../middleware/validate-request");
const customer_model_1 = require("../models/customer.model");
const router = express_1.default.Router();
const registerValidation = [
    (0, express_validator_1.body)('firstName').trim().notEmpty().withMessage('First name is required'),
    (0, express_validator_1.body)('lastName').trim().notEmpty().withMessage('Last name is required'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    (0, express_validator_1.body)('phone').optional().isMobilePhone('any').withMessage('Valid phone number is required'),
];
const loginValidation = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
];
router.post('/register', registerValidation, validate_request_1.validateRequest, async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone } = req.body;
        const existingCustomer = await customer_model_1.Customer.findOne({ email });
        if (existingCustomer) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        const customer = new customer_model_1.Customer({
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
        const token = jsonwebtoken_1.default.sign({ customerId: customer._id }, process.env.JWT_SECRET || 'your_jwt_secret_key_here', { expiresIn: '24h' });
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
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error registering customer', error: error.message });
    }
});
router.post('/login', loginValidation, validate_request_1.validateRequest, async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for email:', email);
        const customer = await customer_model_1.Customer.findOne({ email });
        if (!customer) {
            console.log('No customer found with email:', email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, customer.password);
        if (!isValidPassword) {
            console.log('Invalid password for email:', email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        console.log('Login successful for customer:', customer._id);
        customer.lastActivity = new Date();
        await customer.save();
        const token = jsonwebtoken_1.default.sign({ customerId: customer._id }, process.env.JWT_SECRET || 'your_jwt_secret_key_here', { expiresIn: '24h' });
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
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map