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
        fields: ['status']
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
