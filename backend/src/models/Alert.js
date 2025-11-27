const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Alert = sequelize.define('Alert', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    deviceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'devices',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'customers',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    severity: {
      type: DataTypes.ENUM('critical', 'high', 'medium', 'low', 'info'),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM(
        'device-down',
        'device-up',
        'high-latency',
        'bandwidth-exceeded',
        'cpu-high',
        'memory-high',
        'payment-due',
        'payment-overdue',
        'subscription-expiring',
        'custom'
      ),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'acknowledged', 'resolved', 'dismissed'),
      defaultValue: 'active',
      allowNull: false
    },
    acknowledgedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    acknowledgedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    resolvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    resolveNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    notificationSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
      comment: 'Additional data related to the alert'
    }
  }, {
    tableName: 'alerts',
    timestamps: true,
    indexes: [
      {
        fields: ['deviceId']
      },
      {
        fields: ['customerId']
      },
      {
        fields: ['status', 'severity', 'createdAt']
      },
      {
        fields: ['type']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  return Alert;
};
