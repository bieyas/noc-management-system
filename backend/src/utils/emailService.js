const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Configure email transport (update with your SMTP settings)
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Send email
  async send(to, subject, html) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noc@yourisp.com',
        to,
        subject,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email:', error.message);
      throw error;
    }
  }

  // Send payment reminder
  async sendPaymentReminder(customer, payment) {
    const subject = `Reminder: Payment Due - Invoice ${payment.invoiceNumber}`;
    const html = `
      <h2>Payment Reminder</h2>
      <p>Dear ${customer.fullName},</p>
      <p>This is a reminder that your payment is due soon.</p>
      <p><strong>Invoice Number:</strong> ${payment.invoiceNumber}</p>
      <p><strong>Amount:</strong> Rp ${payment.amount.toLocaleString()}</p>
      <p><strong>Due Date:</strong> ${payment.dueDate.toLocaleDateString()}</p>
      <p>Please make your payment before the due date to avoid service interruption.</p>
      <p>Thank you for your business!</p>
    `;

    return this.send(customer.email, subject, html);
  }

  // Send device down alert
  async sendDeviceAlert(device, type = 'down') {
    const subject = `Alert: Device ${device.name} is ${type}`;
    const html = `
      <h2>Device ${type === 'down' ? 'Down' : 'Up'} Alert</h2>
      <p><strong>Device:</strong> ${device.name}</p>
      <p><strong>Type:</strong> ${device.type}</p>
      <p><strong>IP Address:</strong> ${device.ipAddress}</p>
      <p><strong>Location:</strong> ${device.location?.name || 'N/A'}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      ${type === 'down' ? '<p style="color: red;">Please check the device immediately!</p>' : '<p style="color: green;">Device is back online.</p>'}
    `;

    // Send to admin email (configure in .env)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@yourisp.com';
    return this.send(adminEmail, subject, html);
  }
}

// Note: Install nodemailer with: npm install nodemailer
// This is optional and can be commented out if email functionality is not needed yet

module.exports = new EmailService();
