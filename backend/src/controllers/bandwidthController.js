const { BandwidthUsage, Customer, Subscription, Device, sequelize } = require('../models');
const { Op } = require('sequelize');

// @desc    Get bandwidth usage
// @route   GET /api/bandwidth
// @access  Private
exports.getBandwidthUsage = async (req, res) => {
  try {
    const { customer, subscription, period, startDate, endDate } = req.query;
    let where = {};

    if (customer) {
      where.customerId = customer;
    }

    if (subscription) {
      where.subscriptionId = subscription;
    }

    if (period) {
      where.period = period;
    }

    if (startDate && endDate) {
      where.timestamp = {
        [Op.gte]: new Date(startDate),
        [Op.lte]: new Date(endDate)
      };
    }

    const usage = await BandwidthUsage.findAll({
      where,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'customerId', 'fullName']
        },
        {
          model: Subscription,
          as: 'subscription',
          attributes: ['id', 'packageName', 'bandwidth']
        }
      ],
      order: [['timestamp', 'DESC']],
      limit: 1000
    });

    res.status(200).json({
      success: true,
      count: usage.length,
      data: usage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single bandwidth usage
// @route   GET /api/bandwidth/:id
// @access  Private
exports.getSingleBandwidthUsage = async (req, res) => {
  try {
    const usage = await BandwidthUsage.findByPk(req.params.id, {
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'customerId', 'fullName', 'email']
        },
        {
          model: Subscription,
          as: 'subscription',
          attributes: ['id', 'packageName', 'bandwidth', 'price']
        },
        {
          model: Device,
          as: 'device',
          attributes: ['id', 'deviceId', 'name', 'ipAddress']
        }
      ]
    });

    if (!usage) {
      return res.status(404).json({
        success: false,
        message: 'Bandwidth usage not found'
      });
    }

    res.status(200).json({
      success: true,
      data: usage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create bandwidth usage record
// @route   POST /api/bandwidth
// @access  Private
exports.createBandwidthUsage = async (req, res) => {
  try {
    const usage = await BandwidthUsage.create(req.body);

    res.status(201).json({
      success: true,
      data: usage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get bandwidth summary for customer
// @route   GET /api/bandwidth/customer/:customerId/summary
// @access  Private
exports.getCustomerBandwidthSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let where = { customerId: req.params.customerId };

    if (startDate && endDate) {
      where.timestamp = {
        [Op.gte]: new Date(startDate),
        [Op.lte]: new Date(endDate)
      };
    }

    const summary = await BandwidthUsage.findOne({
      where,
      attributes: [
        [sequelize.fn('SUM', sequelize.col('download')), 'totalDownload'],
        [sequelize.fn('SUM', sequelize.col('upload')), 'totalUpload'],
        [sequelize.fn('SUM', sequelize.col('totalUsage')), 'totalUsage'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'recordCount']
      ]
    });

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get top bandwidth consumers
// @route   GET /api/bandwidth/top
// @access  Private
exports.getTopConsumers = async (req, res) => {
  try {
    const { limit = 10, period = 'daily' } = req.query;

    const topConsumers = await BandwidthUsage.findAll({
      where: { period },
      attributes: [
        'customerId',
        [sequelize.fn('SUM', sequelize.col('totalUsage')), 'total']
      ],
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'customerId', 'fullName', 'email']
        }
      ],
      group: ['customerId', 'customer.id'],
      order: [[sequelize.literal('total'), 'DESC']],
      limit: parseInt(limit)
    });

    res.status(200).json({
      success: true,
      count: topConsumers.length,
      data: topConsumers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
