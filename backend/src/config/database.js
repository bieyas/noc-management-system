const { Sequelize } = require('sequelize');

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME || 'nocman_db',
  process.env.DB_USER || 'nocman_user',
  process.env.DB_PASSWORD || 'nocman_pass_2024',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    timezone: '+07:00',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      timestamps: true,
      underscored: false
    }
  }
);

// Test connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ MySQL/MariaDB Connected: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
    
    // Sync database in development (create tables if they don't exist)
    if (process.env.NODE_ENV === 'development' && process.env.DB_SYNC === 'true') {
      await sequelize.sync({ alter: false });
      console.log('✅ Database synchronized');
    }
  } catch (error) {
    console.error(`❌ Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
