/**
 * Database Sync Script
 * Synchronizes Sequelize models with MariaDB database
 * Run: npm run db:sync
 */

// Load environment variables
require('dotenv').config();

const { sequelize } = require('../src/models');

async function syncDatabase() {
  try {
    console.log('🔄 Starting database synchronization...');
    console.log('📍 Database:', process.env.DB_NAME);
    console.log('📍 Host:', process.env.DB_HOST);
    
    // Test connection first
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    
    // Sync all models
    // alter: true will update tables if they exist (safer than force: true)
    // force: false means don't drop tables
    await sequelize.sync({ alter: process.env.DB_SYNC === 'true' });
    
    console.log('\n✅ Database synchronization completed!');
    console.log('📊 Tables created/updated:');
    console.log('   - users');
    console.log('   - customers');
    console.log('   - devices');
    console.log('   - subscriptions');
    console.log('   - payments');
    console.log('   - alerts');
    console.log('   - network_logs');
    console.log('   - bandwidth_usage');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database synchronization failed:', error.message);
    console.error('Details:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  syncDatabase();
}

module.exports = syncDatabase;
