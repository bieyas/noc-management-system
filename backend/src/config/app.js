module.exports = {
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
  jwtSecret: process.env.JWT_SECRET || 'default-secret-key',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  
  // Monitoring configuration
  monitoring: {
    pingInterval: parseInt(process.env.PING_INTERVAL) || 60000, // 1 minute
    alertCheckInterval: parseInt(process.env.ALERT_CHECK_INTERVAL) || 300000, // 5 minutes
  }
};
