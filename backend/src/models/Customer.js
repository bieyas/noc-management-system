const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Customer = sequelize.define('Customer', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    customerId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    fullName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isEmail: true,
        notEmpty: true
      },
      set(value) {
        this.setDataValue('email', value.toLowerCase());
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    address: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
      comment: 'JSON with fields: street, city, province, postalCode, coordinates {latitude, longitude}'
    },
    identityNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'suspended', 'inactive', 'pending'),
      defaultValue: 'pending',
      allowNull: false
    },
    
    // Service Information
    serviceType: {
      type: DataTypes.ENUM('pppoe', 'hotspot', 'static'),
      defaultValue: 'pppoe',
      allowNull: true
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      comment: 'PPPoE/Hotspot username'
    },
    planName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Internet plan/package name'
    },
    bandwidth: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'e.g., 10M/10M, 20M/20M'
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: 'Assigned IP address'
    },
    
    // Device Information
    deviceInfo: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Device details: type, brand, model, signal strength, etc.'
    },
    macAddress: {
      type: DataTypes.STRING(17),
      allowNull: true,
      comment: 'CPE MAC address'
    },
    lastDeviceType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Last detected device type'
    },
    
    // Connection Status (from MikroTik)
    connectionStatus: {
      type: DataTypes.ENUM('online', 'offline', 'unknown'),
      defaultValue: 'offline',
      allowNull: true,
      comment: 'Real-time connection status from MikroTik'
    },
    lastOnline: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Last seen online timestamp'
    },
    
    // Billing Information
    monthlyFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Monthly subscription fee'
    },
    billingDay: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: true,
      validate: {
        min: 1,
        max: 31
      },
      comment: 'Day of month for billing'
    },
    
    // Dates
    installationDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Service installation date'
    },
    registrationDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'customers',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['customerId']
      },
      {
        fields: ['email']
      },
      {
        fields: ['username']
      },
      {
        fields: ['status']
      },
      {
        fields: ['connectionStatus']
      },
      {
        fields: ['registrationDate']
      }
    ],
    hooks: {
      beforeValidate: (customer) => {
        if (!customer.customerId) {
          const timestamp = Date.now();
          customer.customerId = `CUS${timestamp}`;
        }
      }
    }
  });

  return Customer;
};
