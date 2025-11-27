const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Subscription = sequelize.define('Subscription', {
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
    packageName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    bandwidth: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        notEmpty: true
      },
      comment: 'JSON with fields: download (Mbps), upload (Mbps)'
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    billingCycle: {
      type: DataTypes.ENUM('monthly', 'quarterly', 'yearly'),
      defaultValue: 'monthly',
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'expired', 'suspended', 'cancelled'),
      defaultValue: 'active',
      allowNull: false
    },
    autoRenew: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
      validate: {
        isIP: true
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'subscriptions',
    timestamps: true,
    indexes: [
      {
        fields: ['customerId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['startDate']
      },
      {
        fields: ['endDate']
      },
      {
        fields: ['billingCycle']
      }
    ]
  });

  return Subscription;
};
