const { sequelize } = require('./src/models');

async function runMigration() {
  try {
    console.log('Running database migration...');
    
    // Add description column
    await sequelize.query(`
      ALTER TABLE devices ADD COLUMN IF NOT EXISTS description TEXT NULL COMMENT 'Device description'
    `);
    console.log('✅ Added description column');
    
    // Add apiConfig column
    await sequelize.query(`
      ALTER TABLE devices ADD COLUMN IF NOT EXISTS apiConfig JSON NULL COMMENT 'JSON with API configuration'
    `);
    console.log('✅ Added apiConfig column');
    
    // Change location to VARCHAR
    await sequelize.query(`
      ALTER TABLE devices MODIFY COLUMN location VARCHAR(200) NULL COMMENT 'Device location/address'
    `);
    console.log('✅ Modified location column');
    
    // Update device type enum
    await sequelize.query(`
      ALTER TABLE devices MODIFY COLUMN type ENUM('router', 'switch', 'access-point', 'server', 'firewall', 'mikrotik', 'olt', 'other') NOT NULL
    `);
    console.log('✅ Updated device type enum');
    
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
