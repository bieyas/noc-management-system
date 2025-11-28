const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Device = sequelize.define('Device', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    deviceId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    type: {
      type: DataTypes.ENUM('router', 'switch', 'access-point', 'server', 'firewall', 'mikrotik', 'olt', 'pop', 'odp', 'other'),
      allowNull: false
    },
    brand: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    model: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: false,
      validate: {
        notEmpty: true,
        isIP: true
      }
    },
    macAddress: {
      type: DataTypes.STRING(17),
      allowNull: true
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Device location/address'
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
      comment: 'GPS latitude coordinate'
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
      comment: 'GPS longitude coordinate'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Device description'
    },
    status: {
      type: DataTypes.ENUM('online', 'offline', 'warning', 'maintenance'),
      defaultValue: 'offline',
      allowNull: false
    },
    lastSeen: {
      type: DataTypes.DATE,
      allowNull: true
    },
    uptime: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: 'Uptime in seconds'
    },
    snmpCommunity: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'SNMP community string - hidden by default'
    },
    snmpVersion: {
      type: DataTypes.ENUM('v1', 'v2c', 'v3'),
      defaultValue: 'v2c',
      allowNull: false
    },
    credentials: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
      comment: 'JSON with fields: username, password - hidden by default'
    },
    apiConfig: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
      comment: 'JSON with API configuration (port, username, password, useSsl) for MikroTik and similar devices'
    },
    monitoring: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: { enabled: true, pingInterval: 60000 },
      comment: 'JSON with fields: enabled (boolean), pingInterval (number in ms)'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'devices',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['deviceId']
      },
      {
        fields: ['ipAddress']
      },
      {
        fields: ['type']
      },
      {
        fields: ['status']
      },
      {
        fields: ['lastSeen']
      }
    ],
    hooks: {
      beforeValidate: (device) => {
        if (!device.deviceId) {
          const timestamp = Date.now();
          device.deviceId = `DEV${timestamp}`;
        }
      }
    },
    defaultScope: {
      attributes: { exclude: ['snmpCommunity', 'credentials', 'apiConfig'] }
    },
    scopes: {
      withCredentials: {
        attributes: { include: ['snmpCommunity', 'credentials', 'apiConfig'] }
      }
    }
  });

  return Device;
};
