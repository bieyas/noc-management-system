const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BandwidthUsage = sequelize.define('BandwidthUsage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    subscriptionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'subscriptions',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    deviceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'devices',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    },
    download: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Download usage in MB'
    },
    upload: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Upload usage in MB'
    },
    totalUsage: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Total usage in MB (calculated)'
    },
    period: {
      type: DataTypes.ENUM('hourly', 'daily', 'monthly'),
      defaultValue: 'hourly',
      allowNull: false
    },
    billingCycle: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'JSON with fields: start (date), end (date)'
    }
  }, {
    tableName: 'bandwidth_usage',
    timestamps: false,
    indexes: [
      {
        fields: ['customerId', 'timestamp']
      },
      {
        fields: ['subscriptionId']
      },
      {
        fields: ['deviceId']
      },
      {
        fields: ['timestamp']
      },
      {
        fields: ['period']
      }
    ],
    hooks: {
      beforeCreate: (usage) => {
        // Calculate total before saving
        usage.totalUsage = parseFloat(usage.download) + parseFloat(usage.upload);
      },
      beforeUpdate: (usage) => {
        // Recalculate total if download or upload changed
        if (usage.changed('download') || usage.changed('upload')) {
          usage.totalUsage = parseFloat(usage.download) + parseFloat(usage.upload);
        }
      }
    }
  });

  return BandwidthUsage;
};
