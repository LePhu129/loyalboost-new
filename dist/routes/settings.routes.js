"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
const express_validator_1 = require("express-validator");
const validate_request_1 = require("../middleware/validate-request");
const settings_model_1 = require("../models/settings.model");
const router = express.Router();
const settingsValidation = [
    (0, express_validator_1.body)('pointsPerDollar').isInt({ min: 0 }).withMessage('Points per dollar must be non-negative'),
    (0, express_validator_1.body)('minimumPurchase').isInt({ min: 0 }).withMessage('Minimum purchase must be non-negative'),
    (0, express_validator_1.body)('pointsExpiry').isInt({ min: 0 }).withMessage('Points expiry must be non-negative'),
    (0, express_validator_1.body)('tiers.silver').isInt({ min: 0 }).withMessage('Silver tier threshold must be non-negative'),
    (0, express_validator_1.body)('tiers.gold').isInt({ min: 0 }).withMessage('Gold tier threshold must be non-negative'),
    (0, express_validator_1.body)('tiers.platinum').isInt({ min: 0 }).withMessage('Platinum tier threshold must be non-negative'),
    (0, express_validator_1.body)('notifications.pointsEarned').isBoolean(),
    (0, express_validator_1.body)('notifications.pointsExpiring').isBoolean(),
    (0, express_validator_1.body)('notifications.tierChange').isBoolean(),
    (0, express_validator_1.body)('notifications.specialOffers').isBoolean(),
];
router.get('/', async (_req, res) => {
    try {
        let settings = await settings_model_1.Settings.findOne();
        if (!settings) {
            settings = new settings_model_1.Settings({});
            await settings.save();
        }
        res.json(settings);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching settings', error });
    }
});
router.put('/', settingsValidation, validate_request_1.validateRequest, async (req, res) => {
    try {
        const updates = req.body;
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
        let settings = await settings_model_1.Settings.findOne();
        if (!settings) {
            settings = new settings_model_1.Settings(updates);
        }
        else {
            Object.assign(settings, updates);
        }
        await settings.save();
        res.json(settings);
    }
    catch (error) {
        res.status(400).json({ message: 'Error updating settings', error });
    }
});
router.get('/tiers', async (_req, res) => {
    try {
        const settings = await settings_model_1.Settings.findOne();
        if (!settings) {
            return res.status(404).json({ message: 'Settings not found' });
        }
        res.json(settings.tiers);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching tier settings', error });
    }
});
router.get('/notifications', async (_req, res) => {
    try {
        const settings = await settings_model_1.Settings.findOne();
        if (!settings) {
            return res.status(404).json({ message: 'Settings not found' });
        }
        res.json(settings.notifications);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching notification settings', error });
    }
});
exports.default = router;
//# sourceMappingURL=settings.routes.js.map