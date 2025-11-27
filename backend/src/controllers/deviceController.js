const { Device, NetworkLog, sequelize } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all devices
// @route   GET /api/devices
// @access  Private
exports.getDevices = async (req, res) => {
  try {
    const { type, status, search } = req.query;
    let where = {};

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { deviceId: { [Op.like]: `%${search}%` } },
        { ipAddress: { [Op.like]: `%${search}%` } }
      ];
    }

    const devices = await Device.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: devices.length,
      data: devices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single device
// @route   GET /api/devices/:id
// @access  Private
exports.getDevice = async (req, res) => {
  try {
    const device = await Device.findByPk(req.params.id);

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    res.status(200).json({
      success: true,
      data: device
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new device
// @route   POST /api/devices
// @access  Private
exports.createDevice = async (req, res) => {
  try {
    // Generate device ID if not provided
    if (!req.body.deviceId) {
      const count = await Device.count();
      req.body.deviceId = `DEV-${String(count + 1).padStart(6, '0')}`;
    }

    // Set initial status to online for MikroTik if test was successful
    if (req.body.type === 'mikrotik' && req.body.apiConfig) {
      req.body.status = 'online';
      req.body.lastSeen = new Date();
    }

    const device = await Device.create(req.body);

    res.status(201).json({
      success: true,
      data: device
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update device
// @route   PUT /api/devices/:id
// @access  Private
exports.updateDevice = async (req, res) => {
  try {
    const [updated] = await Device.update(req.body, {
      where: { id: req.params.id }
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    const device = await Device.findByPk(req.params.id);

    res.status(200).json({
      success: true,
      data: device
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete device
// @route   DELETE /api/devices/:id
// @access  Private (Admin only)
exports.deleteDevice = async (req, res) => {
  try {
    const deleted = await Device.destroy({
      where: { id: req.params.id }
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Device deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get device statistics
// @route   GET /api/devices/stats
// @access  Private
exports.getDeviceStats = async (req, res) => {
  try {
    // Group by status
    const statusStats = await Device.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    // Group by type
    const typeStats = await Device.findAll({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['type']
    });

    res.status(200).json({
      success: true,
      data: {
        byStatus: statusStats.map(s => ({ _id: s.status, count: s.dataValues.count })),
        byType: typeStats.map(t => ({ _id: t.type, count: t.dataValues.count }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get device logs
// @route   GET /api/devices/:id/logs
// @access  Private
exports.getDeviceLogs = async (req, res) => {
  try {
    const { logType, startDate, endDate, limit = 100 } = req.query;
    let where = { deviceId: req.params.id };

    if (logType) {
      where.logType = logType;
    }

    if (startDate && endDate) {
      where.timestamp = {
        [Op.gte]: new Date(startDate),
        [Op.lte]: new Date(endDate)
      };
    }

    const logs = await NetworkLog.findAll({
      where,
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit)
    });

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
