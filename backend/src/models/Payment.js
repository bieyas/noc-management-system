const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    invoiceNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
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
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'transfer', 'e-wallet', 'credit-card', 'other'),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'overdue', 'cancelled'),
      defaultValue: 'pending',
      allowNull: false
    },
    billingPeriod: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'JSON with fields: start (date), end (date)'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    processedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    }
  }, {
    tableName: 'payments',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['invoiceNumber']
      },
      {
        fields: ['customerId']
      },
      {
        fields: ['subscriptionId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['dueDate']
      },
      {
        fields: ['paymentDate']
      }
    ],
    hooks: {
      beforeValidate: async (payment) => {
        // Auto-generate invoice number if not provided
        if (!payment.invoiceNumber) {
          const count = await Payment.count();
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          payment.invoiceNumber = `INV-${year}${month}-${String(count + 1).padStart(5, '0')}`;
        }
      }
    }
  });

  return Payment;
};
