const { Alert, Device, Customer, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all alerts
// @route   GET /api/alerts
// @access  Private
exports.getAlerts = async (req, res) => {
  try {
    const { status, severity, type, device } = req.query;
    let where = {};

    if (status) {
      where.status = status;
    }

    if (severity) {
      where.severity = severity;
    }

    if (type) {
      where.type = type;
    }

    if (device) {
      where.deviceId = device;
    }

    const alerts = await Alert.findAll({
      where,
      include: [
        {
          model: Device,
          as: 'device',
          attributes: ['id', 'deviceId', 'name', 'ipAddress', 'status']
        },
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'customerId', 'fullName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single alert
// @route   GET /api/alerts/:id
// @access  Private
exports.getAlert = async (req, res) => {
  try {
    const alert = await Alert.findByPk(req.params.id, {
      include: [
        {
          model: Device,
          as: 'device',
          attributes: ['id', 'deviceId', 'name', 'ipAddress', 'type', 'status']
        },
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'customerId', 'fullName', 'email', 'phone']
        },
        {
          model: User,
          as: 'acknowledgedByUser',
          attributes: ['id', 'username', 'fullName']
        },
        {
          model: User,
          as: 'resolvedByUser',
          attributes: ['id', 'username', 'fullName']
        }
      ]
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new alert
// @route   POST /api/alerts
// @access  Private
exports.createAlert = async (req, res) => {
  try {
    const alert = await Alert.create(req.body);

    res.status(201).json({
      success: true,
      data: alert
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Acknowledge alert
// @route   PUT /api/alerts/:id/acknowledge
// @access  Private
exports.acknowledgeAlert = async (req, res) => {
  try {
    const [updated] = await Alert.update(
      {
        status: 'acknowledged',
        acknowledgedBy: req.user.id,
        acknowledgedAt: new Date()
      },
      { where: { id: req.params.id } }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    const alert = await Alert.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'acknowledgedByUser',
          attributes: ['id', 'username', 'fullName']
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Resolve alert
// @route   PUT /api/alerts/:id/resolve
// @access  Private
exports.resolveAlert = async (req, res) => {
  try {
    const { resolveNotes } = req.body;

    const [updated] = await Alert.update(
      {
        status: 'resolved',
        resolvedBy: req.user.id,
        resolvedAt: new Date(),
        resolveNotes
      },
      { where: { id: req.params.id } }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    const alert = await Alert.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'resolvedByUser',
          attributes: ['id', 'username', 'fullName']
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Dismiss alert
// @route   PUT /api/alerts/:id/dismiss
// @access  Private
exports.dismissAlert = async (req, res) => {
  try {
    const [updated] = await Alert.update(
      { status: 'dismissed' },
      { where: { id: req.params.id } }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    const alert = await Alert.findByPk(req.params.id);

    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete alert
// @route   DELETE /api/alerts/:id
// @access  Private (Admin only)
exports.deleteAlert = async (req, res) => {
  try {
    const deleted = await Alert.destroy({
      where: { id: req.params.id }
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get alert statistics
// @route   GET /api/alerts/stats
// @access  Private
exports.getAlertStats = async (req, res) => {
  try {
    const stats = {
      total: await Alert.count(),
      active: await Alert.count({ where: { status: 'active' } }),
      acknowledged: await Alert.count({ where: { status: 'acknowledged' } }),
      resolved: await Alert.count({ where: { status: 'resolved' } }),
      dismissed: await Alert.count({ where: { status: 'dismissed' } }),
      critical: await Alert.count({ where: { severity: 'critical', status: 'active' } }),
      high: await Alert.count({ where: { severity: 'high', status: 'active' } })
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
