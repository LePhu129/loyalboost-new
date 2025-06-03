import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import analyticsRoutes from './routes/analytics.routes';

// Import routes
import customerRoutes from './routes/customer.routes';
import pointsRoutes from './routes/points.routes';
import rewardsRoutes from './routes/rewards.routes';
import settingsRoutes from './routes/settings.routes';
import authRoutes from './routes/auth.routes';
import transactionRoutes from './routes/transaction.routes';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/loyalboost';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error: Error) => {
    console.error('MongoDB connection error:', error);
  });

// Base API route
app.get('/api', (_req: express.Request, res: express.Response) => {
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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/analytics', analyticsRoutes);

// Serve login page
app.get('/login', (_req: express.Request, res: express.Response) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Serve registration page
app.get('/register', (_req: express.Request, res: express.Response) => {
  res.sendFile(path.join(__dirname, '../public/register.html'));
});

// Serve dashboard page
app.get('/dashboard', (_req: express.Request, res: express.Response) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// Basic route for testing
app.get('/', (_req: express.Request, res: express.Response) => {
  try {
    const indexPath = path.join(__dirname, '../public/index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({ 
          error: 'Error serving the page',
          details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      }
    });
  } catch (error) {
    console.error('Error in root route:', error);
    res.status(500).json({ 
      error: 'Something went wrong!',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Handle 404s
app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    error: 'Something went wrong!',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 