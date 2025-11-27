const { Subscription, Customer } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all subscriptions
// @route   GET /api/subscriptions
// @access  Private
exports.getSubscriptions = async (req, res) => {
  try {
    const { status, customer } = req.query;
    let where = {};

    if (status) {
      where.status = status;
    }

    if (customer) {
      where.customerId = customer;
    }

    const subscriptions = await Subscription.findAll({
      where,
      include: [{
        model: Customer,
        as: 'customer',
        attributes: ['id', 'customerId', 'fullName', 'email', 'phone']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single subscription
// @route   GET /api/subscriptions/:id
// @access  Private
exports.getSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findByPk(req.params.id, {
      include: [{
        model: Customer,
        as: 'customer',
        attributes: ['id', 'customerId', 'fullName', 'email', 'phone', 'address']
      }]
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new subscription
// @route   POST /api/subscriptions
// @access  Private
exports.createSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.create(req.body);
    
    // Reload with customer data
    const subscriptionWithCustomer = await Subscription.findByPk(subscription.id, {
      include: [{
        model: Customer,
        as: 'customer',
        attributes: ['id', 'customerId', 'fullName', 'email', 'phone']
      }]
    });

    res.status(201).json({
      success: true,
      data: subscriptionWithCustomer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update subscription
// @route   PUT /api/subscriptions/:id
// @access  Private
exports.updateSubscription = async (req, res) => {
  try {
    const [updated] = await Subscription.update(req.body, {
      where: { id: req.params.id }
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    const subscription = await Subscription.findByPk(req.params.id, {
      include: [{
        model: Customer,
        as: 'customer',
        attributes: ['id', 'customerId', 'fullName', 'email', 'phone']
      }]
    });

    res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete subscription
// @route   DELETE /api/subscriptions/:id
// @access  Private (Admin only)
exports.deleteSubscription = async (req, res) => {
  try {
    const deleted = await Subscription.destroy({
      where: { id: req.params.id }
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subscription deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update subscription status
// @route   PUT /api/subscriptions/:id/status
// @access  Private
exports.updateSubscriptionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const [updated] = await Subscription.update(
      { status },
      { where: { id: req.params.id } }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    const subscription = await Subscription.findByPk(req.params.id);

    res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get expiring subscriptions
// @route   GET /api/subscriptions/expiring
// @access  Private
exports.getExpiringSubscriptions = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const now = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(now.getDate() + parseInt(days));

    const subscriptions = await Subscription.findAll({
      where: {
        status: 'active',
        endDate: {
          [Op.lte]: expiryDate,
          [Op.gte]: now
        }
      },
      include: [{
        model: Customer,
        as: 'customer',
        attributes: ['id', 'customerId', 'fullName', 'email', 'phone']
      }],
      order: [['endDate', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
