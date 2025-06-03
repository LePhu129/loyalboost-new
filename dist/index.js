"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const customer_routes_1 = __importDefault(require("./routes/customer.routes"));
const points_routes_1 = __importDefault(require("./routes/points.routes"));
const rewards_routes_1 = __importDefault(require("./routes/rewards.routes"));
const settings_routes_1 = __importDefault(require("./routes/settings.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const transaction_routes_1 = __importDefault(require("./routes/transaction.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/loyalboost';
mongoose_1.default.connect(MONGODB_URI)
    .then(() => {
    console.log('Connected to MongoDB');
})
    .catch((error) => {
    console.error('MongoDB connection error:', error);
});
app.get('/api', (_req, res) => {
    res.json({
        message: 'Welcome to LoyalBoost API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            customers: '/api/customers',
            points: '/api/points',
            rewards: '/api/rewards',
            settings: '/api/settings'
        }
    });
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/customers', customer_routes_1.default);
app.use('/api/transactions', transaction_routes_1.default);
app.use('/api/points', points_routes_1.default);
app.use('/api/rewards', rewards_routes_1.default);
app.use('/api/settings', settings_routes_1.default);
app.get('/login', (_req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public/login.html'));
});
app.get('/register', (_req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public/register.html'));
});
app.get('/dashboard', (_req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public/dashboard.html'));
});
app.get('/', (_req, res) => {
    try {
        const indexPath = path_1.default.join(__dirname, '../public/index.html');
        res.sendFile(indexPath, (err) => {
            if (err) {
                console.error('Error sending file:', err);
                res.status(500).json({
                    error: 'Error serving the page',
                    details: process.env.NODE_ENV === 'development' ? err.message : undefined
                });
            }
        });
    }
    catch (error) {
        console.error('Error in root route:', error);
        res.status(500).json({
            error: 'Something went wrong!',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
app.use((err, _req, res, _next) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        error: 'Something went wrong!',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map