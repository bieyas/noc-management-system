require('dotenv').config();
const { sequelize, Customer, Device, Subscription, Payment, Alert, BandwidthUsage, NetworkLog } = require('../src/models');

// Sample data untuk ISP
const sampleCustomers = [
  { fullName: 'PT Maju Jaya', email: 'admin@majujaya.co.id', phone: '021-12345678', identityNumber: '3174051234567890', address: { street: 'Jl. Sudirman No. 123', city: 'Jakarta', province: 'DKI Jakarta', postalCode: '12190' }, status: 'active' },
  { fullName: 'CV Sejahtera Mandiri', email: 'info@sejahtera.com', phone: '021-87654321', identityNumber: '3174062345678901', address: { street: 'Jl. Gatot Subroto No. 45', city: 'Jakarta', province: 'DKI Jakarta', postalCode: '12930' }, status: 'active' },
  { fullName: 'UD Berkah Selalu', email: 'contact@berkah.net', phone: '021-55667788', identityNumber: '3174073456789012', address: { street: 'Jl. Thamrin No. 67', city: 'Jakarta', province: 'DKI Jakarta', postalCode: '10350' }, status: 'active' },
  { fullName: 'Toko Elektronik Jaya', email: 'jaya@elektronik.id', phone: '021-99887766', identityNumber: '3174084567890123', address: { street: 'Jl. Mangga Dua No. 88', city: 'Jakarta', province: 'DKI Jakarta', postalCode: '14430' }, status: 'active' },
  { fullName: 'Warnet Cyber Net', email: 'admin@cybernet.id', phone: '021-44556677', identityNumber: '3174095678901234', address: { street: 'Jl. Kebon Jeruk No. 22', city: 'Jakarta', province: 'DKI Jakarta', postalCode: '11530' }, status: 'active' },
  { fullName: 'Cafe Kopi Hangat', email: 'info@kopihangat.com', phone: '021-33445566', identityNumber: '3174106789012345', address: { street: 'Jl. Senopati No. 15', city: 'Jakarta', province: 'DKI Jakarta', postalCode: '12190' }, status: 'active' },
  { fullName: 'Hotel Bintang Lima', email: 'it@bintang5.co.id', phone: '021-22334455', identityNumber: '3174117890123456', address: { street: 'Jl. HR Rasuna Said No. 100', city: 'Jakarta', province: 'DKI Jakarta', postalCode: '12940' }, status: 'active' },
  { fullName: 'Restoran Padang Sederhana', email: 'padang@sederhana.net', phone: '021-11223344', identityNumber: '3174128901234567', address: { street: 'Jl. Sabang No. 33', city: 'Jakarta', province: 'DKI Jakarta', postalCode: '10340' }, status: 'active' },
  { fullName: 'Klinik Sehat Sentosa', email: 'admin@sehatsentosa.id', phone: '021-66778899', identityNumber: '3174139012345678', address: { street: 'Jl. Fatmawati No. 55', city: 'Jakarta', province: 'DKI Jakarta', postalCode: '12420' }, status: 'suspended' },
  { fullName: 'Sekolah Global Academy', email: 'it@globalacademy.sch.id', phone: '021-77889900', identityNumber: '3174140123456789', address: { street: 'Jl. Kemang Raya No. 77', city: 'Jakarta', province: 'DKI Jakarta', postalCode: '12730' }, status: 'active' }
];

const packageTypes = [
  { name: 'Home 10Mbps', bandwidth: { download: 10, upload: 10, unit: 'Mbps' }, price: 250000, billingCycle: 'monthly' },
  { name: 'Home 20Mbps', bandwidth: { download: 20, upload: 20, unit: 'Mbps' }, price: 400000, billingCycle: 'monthly' },
  { name: 'Business 50Mbps', bandwidth: { download: 50, upload: 50, unit: 'Mbps' }, price: 1000000, billingCycle: 'monthly' },
  { name: 'Business 100Mbps', bandwidth: { download: 100, upload: 100, unit: 'Mbps' }, price: 1800000, billingCycle: 'monthly' },
  { name: 'Enterprise 1Gbps', bandwidth: { download: 1000, upload: 1000, unit: 'Mbps' }, price: 5000000, billingCycle: 'monthly' }
];

const deviceTypes = [
  { type: 'router', brands: ['MikroTik', 'Cisco', 'Ubiquiti'] },
  { type: 'switch', brands: ['TP-Link', 'Cisco', 'D-Link'] },
  { type: 'access-point', brands: ['Ubiquiti', 'TP-Link', 'Aruba'] }
];

async function seedData() {
  try {
    console.log('🌱 Starting data seeding...\n');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing sample data...');
    await BandwidthUsage.destroy({ where: {}, force: true });
    await NetworkLog.destroy({ where: {}, force: true });
    await Payment.destroy({ where: {}, force: true });
    await Alert.destroy({ where: {}, force: true });
    await Device.destroy({ where: {}, force: true });
    await Subscription.destroy({ where: {}, force: true });
    await Customer.destroy({ where: { customerId: { [sequelize.Sequelize.Op.like]: 'CUS%' } }, force: true });
    console.log('✅ Old data cleared\n');

    // Create Customers
    console.log('👥 Creating customers...');
    const customers = [];
    for (const customerData of sampleCustomers) {
      const customer = await Customer.create(customerData);
      customers.push(customer);
      console.log(`   ✓ ${customer.fullName} (${customer.customerId})`);
    }
    console.log(`✅ Created ${customers.length} customers\n`);

    // Create Devices for each customer
    console.log('🖥️  Creating devices...');
    const devices = [];
    let deviceCount = 0;
    for (const customer of customers) {
      const numDevices = Math.floor(Math.random() * 3) + 2; // 2-4 devices per customer
      
      for (let i = 0; i < numDevices; i++) {
        const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
        const brand = deviceType.brands[Math.floor(Math.random() * deviceType.brands.length)];
        const ipOctet = 10 + deviceCount;
        
        const device = await Device.create({
          customerId: customer.id,
          name: `${brand} ${deviceType.type} - ${customer.fullName.substring(0, 15)}`,
          type: deviceType.type,
          brand: brand,
          model: `${brand}-${Math.floor(Math.random() * 9000) + 1000}`,
          ipAddress: `192.168.${Math.floor(ipOctet / 254)}.${ipOctet % 254 + 1}`,
          macAddress: `00:11:22:33:${Math.floor(Math.random() * 256).toString(16).padStart(2, '0')}:${Math.floor(Math.random() * 256).toString(16).padStart(2, '0')}`,
          location: { name: customer.address.city },
          status: Math.random() > 0.2 ? 'online' : 'offline',
          monitoring: { enabled: true, interval: 60 }
        });
        
        devices.push(device);
        deviceCount++;
      }
      console.log(`   ✓ ${numDevices} devices for ${customer.fullName}`);
    }
    console.log(`✅ Created ${devices.length} devices\n`);

    // Create Subscriptions
    console.log('📦 Creating subscriptions...');
    const subscriptions = [];
    const now = new Date();
    
    for (const customer of customers) {
      const pkg = packageTypes[Math.floor(Math.random() * packageTypes.length)];
      const startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - Math.floor(Math.random() * 6)); // Started 0-6 months ago
      
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1); // 1 month duration
      
      const subscription = await Subscription.create({
        customerId: customer.id,
        packageName: pkg.name,
        bandwidth: pkg.bandwidth,
        price: pkg.price,
        billingCycle: pkg.billingCycle,
        startDate: startDate,
        endDate: endDate,
        status: customer.status === 'suspended' ? 'suspended' : (endDate > now ? 'active' : 'expired')
      });
      
      subscriptions.push(subscription);
      console.log(`   ✓ ${subscription.packageName} for ${customer.fullName}`);
    }
    console.log(`✅ Created ${subscriptions.length} subscriptions\n`);

    // Create Payments
    console.log('💰 Creating payments...');
    let paymentCount = 0;
    
    for (const subscription of subscriptions) {
      const customer = customers.find(c => c.id === subscription.customerId);
      const numPayments = Math.floor(Math.random() * 3) + 1; // 1-3 payments
      
      for (let i = 0; i < numPayments; i++) {
        const dueDate = new Date(subscription.startDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        
        const paymentDate = Math.random() > 0.3 ? new Date(dueDate.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000) : null; // 70% paid
        
        paymentCount++;
        const payment = await Payment.create({
          customerId: customer.id,
          subscriptionId: subscription.id,
          amount: subscription.price,
          dueDate: dueDate,
          paymentDate: paymentDate,
          paymentMethod: paymentDate ? ['transfer', 'cash', 'e-wallet'][Math.floor(Math.random() * 3)] : null,
          status: paymentDate ? 'paid' : (dueDate < now ? 'overdue' : 'pending'),
          processedBy: 1 // admin user
        });
      }
      console.log(`   ✓ ${numPayments} payments for ${customer.fullName}`);
    }
    console.log(`✅ Created ${paymentCount} payments\n`);

    // Create Alerts
    console.log('🚨 Creating alerts...');
    const alertTypes = [
      { type: 'device-down', severity: 'high', title: 'Device Offline' },
      { type: 'high-latency', severity: 'medium', title: 'High Latency Detected' },
      { type: 'bandwidth-exceeded', severity: 'low', title: 'Bandwidth Threshold Exceeded' },
      { type: 'payment-overdue', severity: 'high', title: 'Payment Overdue' }
    ];
    
    let alertCount = 0;
    for (let i = 0; i < 15; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const device = devices.find(d => d.customerId === customer.id);
      const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      
      await Alert.create({
        customerId: customer.id,
        deviceId: device ? device.id : null,
        type: alertType.type,
        severity: alertType.severity,
        title: `${alertType.title} - ${customer.fullName}`,
        description: `Alert generated for ${customer.fullName}. Requires attention.`,
        status: Math.random() > 0.5 ? 'active' : 'resolved',
        metadata: { source: 'automated' }
      });
      
      alertCount++;
    }
    console.log(`✅ Created ${alertCount} alerts\n`);

    // Create Network Logs
    console.log('📊 Creating network logs...');
    let logCount = 0;
    
    for (const device of devices.slice(0, 10)) { // Logs for first 10 devices
      const numLogs = Math.floor(Math.random() * 20) + 10; // 10-30 logs per device
      
      for (let i = 0; i < numLogs; i++) {
        const timestamp = new Date();
        timestamp.setHours(timestamp.getHours() - Math.floor(Math.random() * 24 * 7)); // Last 7 days
        
        await NetworkLog.create({
          deviceId: device.id,
          logType: 'ping',
          timestamp: timestamp,
          responseTime: Math.floor(Math.random() * 100) + 10, // 10-110ms
          status: Math.random() > 0.1 ? 'success' : 'failed',
          message: null
        });
        
        logCount++;
      }
    }
    console.log(`✅ Created ${logCount} network logs\n`);

    // Create Bandwidth Usage
    console.log('📈 Creating bandwidth usage records...');
    let usageCount = 0;
    
    for (const subscription of subscriptions.slice(0, 8)) { // Usage for first 8 subscriptions
      const customer = customers.find(c => c.id === subscription.customerId);
      const device = devices.find(d => d.customerId === customer.id);
      
      const numRecords = 7; // Last 7 days
      
      for (let i = 0; i < numRecords; i++) {
        const timestamp = new Date();
        timestamp.setDate(timestamp.getDate() - i);
        
        const download = Math.floor(Math.random() * 50000000000) + 10000000000; // 10-60 GB
        const upload = Math.floor(Math.random() * 10000000000) + 2000000000; // 2-12 GB
        
        await BandwidthUsage.create({
          customerId: customer.id,
          subscriptionId: subscription.id,
          deviceId: device ? device.id : null,
          timestamp: timestamp,
          download: download,
          upload: upload,
          totalUsage: download + upload,
          period: 'daily'
        });
        
        usageCount++;
      }
    }
    console.log(`✅ Created ${usageCount} bandwidth usage records\n`);

    console.log('═══════════════════════════════════════');
    console.log('🎉 Data seeding completed successfully!');
    console.log('═══════════════════════════════════════');
    console.log('📊 Summary:');
    console.log(`   👥 Customers: ${customers.length}`);
    console.log(`   🖥️  Devices: ${devices.length}`);
    console.log(`   📦 Subscriptions: ${subscriptions.length}`);
    console.log(`   💰 Payments: ${paymentCount}`);
    console.log(`   🚨 Alerts: ${alertCount}`);
    console.log(`   📊 Network Logs: ${logCount}`);
    console.log(`   📈 Bandwidth Records: ${usageCount}`);
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  }
}

// Run the seeder
seedData();
