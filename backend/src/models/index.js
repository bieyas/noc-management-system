/**
 * NOC Management System - Database Models Index
 * Sequelize Models with MariaDB/MySQL
 */

const { sequelize } = require('../config/database');

// Import and initialize all models (they export functions)
const User = require('./User')(sequelize);
const Customer = require('./Customer')(sequelize);
const Subscription = require('./Subscription')(sequelize);
const Payment = require('./Payment')(sequelize);
const Device = require('./Device')(sequelize);
const NetworkLog = require('./NetworkLog')(sequelize);
const Alert = require('./Alert')(sequelize);
const BandwidthUsage = require('./BandwidthUsage')(sequelize);

// Define relationships
Customer.hasMany(Subscription, { foreignKey: 'customerId', as: 'subscriptions' });
Subscription.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

Customer.hasMany(Payment, { foreignKey: 'customerId', as: 'payments' });
Payment.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

Subscription.hasMany(Payment, { foreignKey: 'subscriptionId', as: 'payments' });
Payment.belongsTo(Subscription, { foreignKey: 'subscriptionId', as: 'subscription' });

User.hasMany(Payment, { foreignKey: 'processedBy', as: 'processedPayments' });
Payment.belongsTo(User, { foreignKey: 'processedBy', as: 'processor' });

Device.hasMany(NetworkLog, { foreignKey: 'deviceId', as: 'logs' });
NetworkLog.belongsTo(Device, { foreignKey: 'deviceId', as: 'device' });

Device.hasMany(Alert, { foreignKey: 'deviceId', as: 'alerts' });
Alert.belongsTo(Device, { foreignKey: 'deviceId', as: 'device' });

Customer.hasMany(Alert, { foreignKey: 'customerId', as: 'alerts' });
Alert.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

User.hasMany(Alert, { foreignKey: 'acknowledgedBy', as: 'acknowledgedAlerts' });
User.hasMany(Alert, { foreignKey: 'resolvedBy', as: 'resolvedAlerts' });

Customer.hasMany(BandwidthUsage, { foreignKey: 'customerId', as: 'bandwidthUsage' });
BandwidthUsage.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

Subscription.hasMany(BandwidthUsage, { foreignKey: 'subscriptionId', as: 'bandwidthUsage' });
BandwidthUsage.belongsTo(Subscription, { foreignKey: 'subscriptionId', as: 'subscription' });

module.exports = {
  sequelize,
  User,
  Customer,
  Subscription,
  Payment,
  Device,
  NetworkLog,
  Alert,
  BandwidthUsage
};
