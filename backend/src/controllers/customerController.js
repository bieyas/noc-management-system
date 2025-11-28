const { Customer } = require('../models');
const { Op } = require('sequelize');
const customerSyncService = require('../services/customerSyncService');

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
exports.getCustomers = async (req, res) => {
  try {
    const { status, search, connectionStatus, serviceType } = req.query;
    let where = {};

    if (status) {
      where.status = status;
    }
    
    if (connectionStatus) {
      where.connectionStatus = connectionStatus;
    }
    
    if (serviceType) {
      where.serviceType = serviceType;
    }

    if (search) {
      where[Op.or] = [
        { fullName: { [Op.like]: `%${search}%` } },
        { customerId: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
        { username: { [Op.like]: `%${search}%` } }
      ];
    }

    const customers = await Customer.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
exports.getCustomer = async (req, res) => {
  try {
    // Get customer with real-time data from MikroTik
    const customer = await customerSyncService.getCustomerDetails(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private
exports.createCustomer = async (req, res) => {
  try {
    // Generate customer ID
    const count = await Customer.count();
    const customerId = `CUST-${String(count + 1).padStart(6, '0')}`;

    const customer = await Customer.create({
      ...req.body,
      customerId
    });

    res.status(201).json({
      success: true,
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
exports.updateCustomer = async (req, res) => {
  try {
    const [updated] = await Customer.update(req.body, {
      where: { id: req.params.id }
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const customer = await Customer.findByPk(req.params.id);

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private (Admin only)
exports.deleteCustomer = async (req, res) => {
  try {
    const deleted = await Customer.destroy({
      where: { id: req.params.id }
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update customer status
// @route   PUT /api/customers/:id/status
// @access  Private
exports.updateCustomerStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const [updated] = await Customer.update(
      { status },
      { where: { id: req.params.id } }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const customer = await Customer.findByPk(req.params.id);

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get customer statistics
// @route   GET /api/customers/stats
// @access  Private
exports.getCustomerStats = async (req, res) => {
  try {
    const totalCustomers = await Customer.count();
    const activeCustomers = await Customer.count({ where: { status: 'active' } });
    const onlineCustomers = await Customer.count({ where: { connectionStatus: 'online' } });
    const suspendedCustomers = await Customer.count({ where: { status: 'suspended' } });
    
    const pppoeCount = await Customer.count({ where: { serviceType: 'pppoe' } });
    const hotspotCount = await Customer.count({ where: { serviceType: 'hotspot' } });

    res.json({
      success: true,
      data: {
        total: totalCustomers,
        active: activeCustomers,
        online: onlineCustomers,
        offline: activeCustomers - onlineCustomers,
        suspended: suspendedCustomers,
        byServiceType: {
          pppoe: pppoeCount,
          hotspot: hotspotCount
        }
      }
    });
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching stats', 
      error: error.message 
    });
  }
};

// @desc    Sync customer status from MikroTik
// @route   POST /api/customers/sync/:deviceId?
// @access  Private
exports.syncCustomerStatus = async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    if (deviceId) {
      const { Device } = require('../models');
      const device = await Device.scope('withCredentials').findByPk(deviceId);
      
      if (!device) {
        return res.status(404).json({ 
          success: false,
          message: 'Device not found' 
        });
      }
      
      const result = await customerSyncService.syncCustomerStatus(device);
      res.json({
        success: true,
        data: result
      });
    } else {
      const result = await customerSyncService.syncAllCustomers();
      res.json({
        success: true,
        data: result
      });
    }
  } catch (error) {
    console.error('Error syncing customer status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error syncing status', 
      error: error.message 
    });
  }
};
