const { Payment, Customer, Subscription, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
exports.getPayments = async (req, res) => {
  try {
    const { status, customer, startDate, endDate } = req.query;
    let where = {};

    if (status) {
      where.status = status;
    }

    if (customer) {
      where.customerId = customer;
    }

    if (startDate && endDate) {
      where.createdAt = {
        [Op.gte]: new Date(startDate),
        [Op.lte]: new Date(endDate)
      };
    }

    const payments = await Payment.findAll({
      where,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'customerId', 'fullName', 'email', 'phone']
        },
        {
          model: Subscription,
          as: 'subscription',
          attributes: ['id', 'packageName', 'price', 'billingCycle']
        },
        {
          model: User,
          as: 'processedByUser',
          attributes: ['id', 'fullName', 'username']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
exports.getPayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'customerId', 'fullName', 'email', 'phone', 'address']
        },
        {
          model: Subscription,
          as: 'subscription',
          attributes: ['id', 'packageName', 'price', 'bandwidth', 'billingCycle']
        },
        {
          model: User,
          as: 'processedByUser',
          attributes: ['id', 'fullName', 'username', 'email']
        }
      ]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new payment
// @route   POST /api/payments
// @access  Private
exports.createPayment = async (req, res) => {
  try {
    // Check if customer exists
    const customer = await Customer.findByPk(req.body.customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if subscription exists
    const subscription = await Subscription.findByPk(req.body.subscriptionId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Generate invoice number if not provided
    let invoiceNumber = req.body.invoiceNumber;
    if (!invoiceNumber) {
      const count = await Payment.count();
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      invoiceNumber = `INV${year}${month}${String(count + 1).padStart(5, '0')}`;
    }

    const payment = await Payment.create({
      ...req.body,
      invoiceNumber,
      processedBy: req.user.id
    });

    // Fetch the complete payment with relationships
    const completePayment = await Payment.findByPk(payment.id, {
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'customerId', 'fullName', 'email']
        },
        {
          model: Subscription,
          as: 'subscription',
          attributes: ['id', 'packageName', 'price', 'billingCycle']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: completePayment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update payment
// @route   PUT /api/payments/:id
// @access  Private
exports.updatePayment = async (req, res) => {
  try {
    const [updated] = await Payment.update(req.body, {
      where: { id: req.params.id }
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    const payment = await Payment.findByPk(req.params.id, {
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'customerId', 'fullName', 'email']
        },
        {
          model: Subscription,
          as: 'subscription',
          attributes: ['id', 'packageName', 'price']
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Process payment
// @route   PUT /api/payments/:id/process
// @access  Private
exports.processPayment = async (req, res) => {
  try {
    const { paymentMethod, paymentDate, notes } = req.body;

    const payment = await Payment.findByPk(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment has already been processed'
      });
    }

    await payment.update({
      status: 'paid',
      paymentMethod,
      paymentDate: paymentDate || new Date(),
      notes,
      processedBy: req.user.id
    });

    const updatedPayment = await Payment.findByPk(payment.id, {
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'customerId', 'fullName', 'email']
        },
        {
          model: Subscription,
          as: 'subscription',
          attributes: ['id', 'packageName', 'price']
        },
        {
          model: User,
          as: 'processedByUser',
          attributes: ['id', 'fullName', 'username']
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: updatedPayment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete payment
// @route   DELETE /api/payments/:id
// @access  Private (Admin only)
exports.deletePayment = async (req, res) => {
  try {
    const deleted = await Payment.destroy({
      where: { id: req.params.id }
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get payment statistics
// @route   GET /api/payments/stats
// @access  Private
exports.getPaymentStats = async (req, res) => {
  try {
    const stats = {
      pending: {
        count: await Payment.count({ where: { status: 'pending' } }),
        total: await Payment.sum('amount', { where: { status: 'pending' } }) || 0
      },
      paid: {
        count: await Payment.count({ where: { status: 'paid' } }),
        total: await Payment.sum('amount', { where: { status: 'paid' } }) || 0
      },
      failed: {
        count: await Payment.count({ where: { status: 'failed' } }),
        total: await Payment.sum('amount', { where: { status: 'failed' } }) || 0
      },
      overdue: {
        count: await Payment.count({ where: { status: 'overdue' } }),
        total: await Payment.sum('amount', { where: { status: 'overdue' } }) || 0
      }
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get monthly revenue
// @route   GET /api/payments/revenue/monthly
// @access  Private
exports.getMonthlyRevenue = async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year || new Date().getFullYear();

    const revenue = await Payment.findAll({
      where: {
        status: 'paid',
        paymentDate: {
          [Op.gte]: new Date(`${targetYear}-01-01`),
          [Op.lt]: new Date(`${parseInt(targetYear) + 1}-01-01`)
        }
      },
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('paymentDate')), 'month'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('MONTH', sequelize.col('paymentDate'))],
      order: [[sequelize.fn('MONTH', sequelize.col('paymentDate')), 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: revenue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
