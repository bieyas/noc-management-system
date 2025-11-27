const cron = require('node-cron');
const { Payment, Subscription, Alert, Customer } = require('../models');
const { Op } = require('sequelize');

class BillingService {
  constructor() {
    this.scheduledTasks = [];
  }

  // Check for overdue payments
  async checkOverduePayments() {
    try {
      const now = new Date();
      const overduePayments = await Payment.findAll({
        where: {
          status: 'pending',
          dueDate: { [Op.lt]: now }
        },
        include: [
          {
            model: Customer,
            as: 'customer',
            attributes: ['id', 'customerId', 'fullName']
          }
        ]
      });

      for (const payment of overduePayments) {
        // Update payment status
        await payment.update({ status: 'overdue' });

        // Create alert
        await Alert.create({
          customerId: payment.customerId,
          severity: 'high',
          type: 'payment-overdue',
          title: `Payment overdue for ${payment.customer.fullName}`,
          description: `Invoice ${payment.invoiceNumber} is overdue. Amount: Rp ${payment.amount.toLocaleString()}`,
          status: 'active',
          metadata: {
            invoiceNumber: payment.invoiceNumber,
            amount: payment.amount,
            dueDate: payment.dueDate
          }
        });
      }

      console.log(`Checked ${overduePayments.length} overdue payments`);
    } catch (error) {
      console.error('Error checking overdue payments:', error.message);
    }
  }

  // Check for upcoming payment due dates (7 days before)
  async checkUpcomingPayments() {
    try {
      const now = new Date();
      const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const upcomingPayments = await Payment.findAll({
        where: {
          status: 'pending',
          dueDate: { 
            [Op.gte]: now, 
            [Op.lte]: sevenDaysLater 
          }
        },
        include: [
          {
            model: Customer,
            as: 'customer',
            attributes: ['id', 'customerId', 'fullName']
          }
        ]
      });

      for (const payment of upcomingPayments) {
        // Check if alert already exists
        const existingAlert = await Alert.findOne({
          where: {
            customerId: payment.customerId,
            type: 'payment-due',
            status: 'active',
            metadata: {
              invoiceNumber: payment.invoiceNumber
            }
          }
        });

        if (!existingAlert) {
          await Alert.create({
            customerId: payment.customerId,
            severity: 'medium',
            type: 'payment-due',
            title: `Payment due for ${payment.customer.fullName}`,
            description: `Invoice ${payment.invoiceNumber} is due on ${payment.dueDate.toLocaleDateString()}. Amount: Rp ${payment.amount.toLocaleString()}`,
            status: 'active',
            metadata: {
              invoiceNumber: payment.invoiceNumber,
              amount: payment.amount,
              dueDate: payment.dueDate
            }
          });
        }
      }

      console.log(`Checked ${upcomingPayments.length} upcoming payments`);
    } catch (error) {
      console.error('Error checking upcoming payments:', error.message);
    }
  }

  // Check for expiring subscriptions (30 days before)
  async checkExpiringSubscriptions() {
    try {
      const now = new Date();
      const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const expiringSubscriptions = await Subscription.findAll({
        where: {
          status: 'active',
          endDate: { 
            [Op.gte]: now, 
            [Op.lte]: thirtyDaysLater 
          }
        },
        include: [
          {
            model: Customer,
            as: 'customer',
            attributes: ['id', 'customerId', 'fullName']
          }
        ]
      });

      for (const subscription of expiringSubscriptions) {
        // Check if alert already exists
        const existingAlert = await Alert.findOne({
          where: {
            customerId: subscription.customerId,
            type: 'subscription-expiring',
            status: 'active',
            metadata: {
              subscriptionId: subscription.id
            }
          }
        });

        if (!existingAlert) {
          await Alert.create({
            customerId: subscription.customerId,
            severity: 'medium',
            type: 'subscription-expiring',
            title: `Subscription expiring for ${subscription.customer.fullName}`,
            description: `Subscription "${subscription.packageName}" will expire on ${subscription.endDate.toLocaleDateString()}`,
            status: 'active',
            metadata: {
              subscriptionId: subscription.id,
              packageName: subscription.packageName,
              endDate: subscription.endDate
            }
          });
        }
      }

      console.log(`Checked ${expiringSubscriptions.length} expiring subscriptions`);
    } catch (error) {
      console.error('Error checking expiring subscriptions:', error.message);
    }
  }

  // Automatically expire subscriptions
  async expireSubscriptions() {
    try {
      const now = new Date();

      const [updatedCount] = await Subscription.update(
        { status: 'expired' },
        {
          where: {
            status: 'active',
            endDate: { [Op.lt]: now }
          }
        }
      );

      console.log(`Expired ${updatedCount} subscriptions`);
    } catch (error) {
      console.error('Error expiring subscriptions:', error.message);
    }
  }

  // Start billing automation tasks
  start() {
    console.log('Starting billing automation service...');

    // Check overdue payments daily at 9 AM
    const overdueTask = cron.schedule('0 9 * * *', () => {
      console.log('Running overdue payment check...');
      this.checkOverduePayments();
    });

    // Check upcoming payments daily at 8 AM
    const upcomingTask = cron.schedule('0 8 * * *', () => {
      console.log('Running upcoming payment check...');
      this.checkUpcomingPayments();
    });

    // Check expiring subscriptions daily at 7 AM
    const expiringTask = cron.schedule('0 7 * * *', () => {
      console.log('Running expiring subscription check...');
      this.checkExpiringSubscriptions();
    });

    // Expire subscriptions daily at midnight
    const expireTask = cron.schedule('0 0 * * *', () => {
      console.log('Running subscription expiration...');
      this.expireSubscriptions();
    });

    this.scheduledTasks = [overdueTask, upcomingTask, expiringTask, expireTask];

    console.log('Billing automation service started');
  }

  // Stop billing automation tasks
  stop() {
    console.log('Stopping billing automation service...');
    this.scheduledTasks.forEach(task => task.stop());
    this.scheduledTasks = [];
    console.log('Billing automation service stopped');
  }
}

module.exports = new BillingService();
