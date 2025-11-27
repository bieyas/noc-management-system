require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectDB, sequelize } = require('./config/database');
const { connectRedis } = require('./config/redis');
const config = require('./config/app');
const { errorHandler, notFound } = require('./middleware/error');

// Import services
const monitoringService = require('./services/monitoringService');
const billingService = require('./services/billingService');
const socketService = require('./services/socketService');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const customerRoutes = require('./routes/customers');
const subscriptionRoutes = require('./routes/subscriptions');
const paymentRoutes = require('./routes/payments');
const deviceRoutes = require('./routes/devices');
const alertRoutes = require('./routes/alerts');
const bandwidthRoutes = require('./routes/bandwidth');
const testRoutes = require('./routes/test');
const mikrotikRoutes = require('./routes/mikrotik');

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Connect to Redis (optional)
connectRedis();

// Middleware
app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'NOC Management API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/bandwidth', bandwidthRoutes);
app.use('/api/test', testRoutes);
app.use('/api/mikrotik', mikrotikRoutes);

// Dashboard statistics endpoint
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const Customer = require('./models/Customer');
    const Device = require('./models/Device');
    const Alert = require('./models/Alert');
    const Payment = require('./models/Payment');

    const stats = {
      customers: {
        total: await Customer.countDocuments(),
        active: await Customer.countDocuments({ status: 'active' }),
        pending: await Customer.countDocuments({ status: 'pending' })
      },
      devices: {
        total: await Device.countDocuments(),
        online: await Device.countDocuments({ status: 'online' }),
        offline: await Device.countDocuments({ status: 'offline' })
      },
      alerts: {
        total: await Alert.countDocuments({ status: 'active' }),
        critical: await Alert.countDocuments({ status: 'active', severity: 'critical' }),
        high: await Alert.countDocuments({ status: 'active', severity: 'high' })
      },
      payments: {
        pending: await Payment.countDocuments({ status: 'pending' }),
        overdue: await Payment.countDocuments({ status: 'overdue' }),
        paid: await Payment.countDocuments({ status: 'paid' })
      }
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = config.port;
const HOST = '0.0.0.0'; // Listen on all network interfaces

const server = app.listen(PORT, HOST, () => {
  console.log(`\n🚀 Server running in ${config.env} mode on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}`);
  console.log(`🌐 Network access at http://160.22.31.215:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/health\n`);

  // Initialize WebSocket service
  socketService.initialize(server);

  // Start monitoring service
  monitoringService.start(config.monitoring.pingInterval);

  // Start billing automation
  billingService.start();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  monitoringService.stop();
  billingService.stop();
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = app;
