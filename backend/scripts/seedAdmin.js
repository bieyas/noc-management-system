require('dotenv').config();
const { sequelize, User } = require('../src/models');

const seedAdminUser = async () => {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Check if admin already exists
    const adminExists = await User.findOne({
      where: { role: 'admin' }
    });
    
    if (adminExists) {
      console.log('Admin user already exists');
      console.log('Username:', adminExists.username);
      console.log('Email:', adminExists.email);
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      username: 'admin',
      email: 'admin@nocman.com',
      password: 'admin123',
      fullName: 'System Administrator',
      role: 'admin',
      phone: '08123456789',
      isActive: true
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Username:', admin.username);
    console.log('Email:', admin.email);
    console.log('Password: admin123');
    console.log('Role:', admin.role);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  Please change the password after first login!\n');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error.message);
    process.exit(1);
  }
};

seedAdminUser();
