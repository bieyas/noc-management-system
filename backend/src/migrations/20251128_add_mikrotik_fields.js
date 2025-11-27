'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new device types to enum
    await queryInterface.sequelize.query(`
      ALTER TABLE devices 
      MODIFY COLUMN type ENUM('router', 'switch', 'access-point', 'server', 'firewall', 'mikrotik', 'olt', 'other') NOT NULL
    `);

    // Change location from JSON to STRING
    await queryInterface.changeColumn('devices', 'location', {
      type: Sequelize.STRING(200),
      allowNull: true,
      comment: 'Device location/address'
    });

    // Add description field
    await queryInterface.addColumn('devices', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Device description'
    });

    // Add apiConfig field
    await queryInterface.addColumn('devices', 'apiConfig', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: null,
      comment: 'JSON with API configuration (port, username, password, useSsl) for MikroTik and similar devices'
    });

    console.log('✅ Migration completed: Added MikroTik support fields');
  },

  async down(queryInterface, Sequelize) {
    // Remove apiConfig
    await queryInterface.removeColumn('devices', 'apiConfig');

    // Remove description
    await queryInterface.removeColumn('devices', 'description');

    // Revert location to JSON
    await queryInterface.changeColumn('devices', 'location', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: {}
    });

    // Revert device types enum
    await queryInterface.sequelize.query(`
      ALTER TABLE devices 
      MODIFY COLUMN type ENUM('router', 'switch', 'access-point', 'server', 'firewall', 'other') NOT NULL
    `);

    console.log('✅ Migration reverted: Removed MikroTik support fields');
  }
};
