# NOC Management System - Backend

Backend API untuk sistem manajemen Network Operation Center (NOC) ISP yang mencakup monitoring jaringan dan manajemen billing.

## Fitur Utama

### 1. User Management
- Autentikasi dengan JWT
- Role-based access control (Admin, Staff, Technician)
- CRUD operations untuk user

### 2. Customer Management
- Manajemen data pelanggan
- Tracking status pelanggan (active, suspended, pending)
- History pelanggan

### 3. Subscription Management
- Paket langganan internet
- Bandwidth allocation
- Billing cycle management
- Auto-renewal

### 4. Billing & Payment
- Invoice generation otomatis
- Payment tracking
- Overdue payment alerts
- Payment history

### 5. Network Monitoring
- Device monitoring (Router, Switch, Access Point)
- Real-time ping monitoring
- Network logs
- Bandwidth usage tracking
- Alert system untuk device down/up

### 6. Alert System
- Automated alerts untuk device offline
- Payment due reminders
- Overdue payment notifications
- Subscription expiration warnings

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **node-cron** - Scheduled tasks
- **ping** - Network monitoring

## Struktur Project

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js      # MongoDB connection
│   │   └── app.js           # App configuration
│   ├── models/
│   │   ├── User.js
│   │   ├── Customer.js
│   │   ├── Subscription.js
│   │   ├── Payment.js
│   │   ├── Device.js
│   │   ├── NetworkLog.js
│   │   ├── Alert.js
│   │   └── BandwidthUsage.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── customerController.js
│   │   ├── subscriptionController.js
│   │   ├── paymentController.js
│   │   ├── deviceController.js
│   │   ├── alertController.js
│   │   └── bandwidthController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── customers.js
│   │   ├── subscriptions.js
│   │   ├── payments.js
│   │   ├── devices.js
│   │   ├── alerts.js
│   │   └── bandwidth.js
│   ├── middleware/
│   │   ├── auth.js          # JWT authentication
│   │   ├── error.js         # Error handling
│   │   └── validation.js    # Request validation
│   ├── services/
│   │   ├── monitoringService.js  # Network monitoring
│   │   └── billingService.js     # Billing automation
│   └── index.js             # Application entry point
├── .env.example
├── .gitignore
└── package.json
```

## Setup & Installation

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Setup environment variables:**
```bash
cp .env.example .env
```

Edit `.env` file dengan konfigurasi Anda:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nocman
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
PING_INTERVAL=60000
ALERT_CHECK_INTERVAL=300000
```

3. **Start MongoDB:**
```bash
# Pastikan MongoDB sudah berjalan
sudo systemctl start mongodb
# atau
mongod
```

4. **Run the application:**

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user (Admin only)
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID (Admin)
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer (Admin)
- `PUT /api/customers/:id/status` - Update status

### Subscriptions
- `GET /api/subscriptions` - Get all subscriptions
- `GET /api/subscriptions/:id` - Get subscription
- `POST /api/subscriptions` - Create subscription
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Delete (Admin)

### Payments
- `GET /api/payments` - Get all payments
- `GET /api/payments/stats` - Get payment statistics
- `GET /api/payments/:id` - Get payment
- `POST /api/payments` - Create payment
- `PUT /api/payments/:id/process` - Process payment

### Devices
- `GET /api/devices` - Get all devices
- `GET /api/devices/stats` - Get device statistics
- `GET /api/devices/:id` - Get device
- `POST /api/devices` - Add device
- `PUT /api/devices/:id` - Update device
- `GET /api/devices/:id/logs` - Get device logs

### Alerts
- `GET /api/alerts` - Get all alerts
- `GET /api/alerts/stats` - Get alert statistics
- `GET /api/alerts/:id` - Get alert
- `PUT /api/alerts/:id/acknowledge` - Acknowledge alert
- `PUT /api/alerts/:id/resolve` - Resolve alert

### Bandwidth
- `GET /api/bandwidth` - Get bandwidth usage
- `GET /api/bandwidth/customer/:id/summary` - Get customer summary

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Automated Services

### Monitoring Service
- Ping semua device setiap 1 menit (default)
- Update status device (online/offline)
- Generate alerts untuk device down/up
- Log semua network activity

### Billing Service
- Check overdue payments (daily at 9 AM)
- Check upcoming payment due dates (daily at 8 AM)
- Check expiring subscriptions (daily at 7 AM)
- Auto-expire subscriptions (daily at midnight)

## Default User Roles

- **Admin**: Full access ke semua fitur
- **Staff**: Access ke customer management dan billing
- **Technician**: Access ke device monitoring dan alerts

## Security Features

- JWT-based authentication
- Password hashing dengan bcryptjs
- Role-based access control
- CORS protection
- Helmet.js security headers
- Request validation

## License

ISC
