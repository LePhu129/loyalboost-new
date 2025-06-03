"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const validate_request_1 = require("../middleware/validate-request");
const customer_controller_1 = require("../controllers/customer.controller");
const router = express_1.default.Router();
const customerValidation = [
    (0, express_validator_1.body)('firstName').trim().notEmpty().withMessage('First name is required'),
    (0, express_validator_1.body)('lastName').trim().notEmpty().withMessage('Last name is required'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
];
router.get('/', customer_controller_1.customerController.getAllCustomers);
router.get('/stats', customer_controller_1.customerController.getCustomerStats);
router.get('/:id', customer_controller_1.customerController.getCustomerById);
router.post('/', customerValidation, validate_request_1.validateRequest, customer_controller_1.customerController.createCustomer);
router.put('/:id', customerValidation, validate_request_1.validateRequest, customer_controller_1.customerController.updateCustomer);
router.delete('/:id', customer_controller_1.customerController.deleteCustomer);
exports.default = router;
//# sourceMappingURL=customer.routes.js.map