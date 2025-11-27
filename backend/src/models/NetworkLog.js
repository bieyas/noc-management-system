const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const NetworkLog = sequelize.define('NetworkLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    deviceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'devices',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    logType: {
      type: DataTypes.ENUM('ping', 'bandwidth', 'cpu', 'memory', 'interface', 'system'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('success', 'failed', 'warning'),
      allowNull: false
    },
    responseTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Response time in milliseconds'
    },
    bandwidth: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'JSON with fields: download (Mbps), upload (Mbps)'
    },
    cpuUsage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'CPU usage percentage'
    },
    memoryUsage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Memory usage percentage'
    },
    interfaceStats: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'JSON with fields: name, status, bytesIn, bytesOut, packetsIn, packetsOut, errors'
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    }
  }, {
    tableName: 'network_logs',
    timestamps: false,
    indexes: [
      {
        fields: ['deviceId', 'timestamp']
      },
      {
        fields: ['logType']
      },
      {
        fields: ['status']
      },
      {
        fields: ['timestamp']
      }
    ]
  });

  return NetworkLog;
};
