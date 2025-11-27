# 🚀 NOC Management System (NOC Assistant)

Sistem manajemen Network Operation Center (NOC) untuk ISP (Internet Service Provider) dengan fitur monitoring jaringan, manajemen pelanggan, billing otomatis, dan alert system.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![MariaDB](https://img.shields.io/badge/mariadb-10.11-blue.svg)

## 📋 Fitur Utama

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Staff, Customer)
- Secure password hashing dengan bcrypt

### 👥 Customer Management
- CRUD pelanggan lengkap
- Informasi kontak dan alamat
- Status pelanggan (active, suspended, inactive)
- Auto-generate Customer ID

### 🖥️ Device Monitoring
- Monitor device secara real-time (router, switch, access point)
- Ping monitoring otomatis
- Network logs history
- Device status tracking (online/offline)
- Support SNMP (v1, v2c, v3)

### 📦 Subscription Management
- Paket internet customizable
- Bandwidth management
- Subscription lifecycle (active, expired, suspended)
- Auto-renewal options
- Expiring subscription alerts

### 💰 Billing & Payment
- Invoice generation otomatis
- Multiple payment methods (cash, transfer, e-wallet, credit card)
- Payment status tracking (pending, paid, overdue)
- Payment statistics & reports
- Monthly revenue reports

### 🚨 Alert System
- Real-time alerts untuk network issues
- Multiple severity levels (critical, high, medium, low)
- Alert acknowledgment & resolution workflow
- Alert statistics
- Custom alert types

### 📊 Bandwidth Monitoring
- Real-time bandwidth usage tracking
- Customer bandwidth summary
- Top bandwidth consumers
- Historical usage data

### 🤖 Automation
- Automated device monitoring (ping checks)
- Automatic overdue payment detection
- Subscription expiration automation
- Alert generation untuk critical events
- Billing reminders (7 days before due date)

## 🛠️ Tech Stack

**Backend:**
- **Node.js** v20+ - Runtime environment
- **Express.js** v4.18 - Web framework
- **Sequelize** v6.35 - ORM (Object-Relational Mapping)
- **MariaDB** v10.11 - Primary database
- **Redis** v7 - Caching layer
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **node-cron** - Task scheduling
- **ping** - Network monitoring

**Infrastructure:**
- **Docker** & **Docker Compose** - Containerization
- **phpMyAdmin** - Database management UI

## 📁 Struktur Project

```
nocman/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & Redis configuration
│   │   ├── controllers/     # Request handlers (8 controllers)
│   │   ├── middleware/      # Auth & validation middleware
│   │   ├── models/          # Sequelize models (8 models)
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic (monitoring, billing)
│   │   └── index.js         # Server entry point
│   ├── scripts/
│   │   ├── seedAdmin.js     # Create admin user
│   │   ├── seedData.js      # Generate sample data
│   │   └── syncDatabase.js  # Database synchronization
│   ├── test-api.sh          # Basic API tests
│   ├── test-integration.sh  # Integration tests
│   ├── package.json
│   └── .env.example
├── docker/
│   ├── docker-compose.yml   # Docker services configuration
│   └── .env.example
├── DEPLOYMENT.md            # Deployment guide
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18.0.0 atau lebih tinggi
- **Docker** & **Docker Compose**
- **Git**

### Installation

1. **Clone repository**
```bash
git clone https://github.com/your-username/nocman.git
cd nocman
```

2. **Setup Docker services**
```bash
cd docker
cp .env.example .env
# Edit .env dan sesuaikan password

docker-compose up -d
```

3. **Setup Backend**
```bash
cd ../backend
cp .env.example .env
# Edit .env dan sesuaikan dengan konfigurasi Docker

npm install
```

4. **Database Setup**
```bash
# Sync database tables
npm run db:sync

# Create admin user
npm run seed:admin
```

5. **Start Server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

6. **Verify Installation**
```bash
# Run integration tests
chmod +x test-integration.sh
./test-integration.sh
```

Server akan berjalan di: **http://localhost:5000**

### 🎯 Default Admin Credentials

```
Username: admin
Password: admin123
```

⚠️ **PENTING:** Ganti password admin setelah instalasi pertama!

## 📊 Sample Data (Optional)

Untuk development/testing, generate sample data:

```bash
npm run seed:data
```

Ini akan membuat:
- 👥 10 Customers (ISP clients)
- 🖥️ 26+ Devices (routers, switches, access points)
- 📦 10 Subscriptions (berbagai paket internet)
- 💰 17+ Payments (dengan berbagai status)
- 🚨 15+ Alerts
- 📊 200+ Network logs
- 📈 56+ Bandwidth usage records

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register      # Register user baru
POST   /api/auth/login         # Login & get JWT token
GET    /api/auth/me            # Get current user profile
```

### Customers
```
GET    /api/customers          # Get all customers
GET    /api/customers/:id      # Get single customer
POST   /api/customers          # Create customer
PUT    /api/customers/:id      # Update customer
DELETE /api/customers/:id      # Delete customer
```

### Devices
```
GET    /api/devices            # Get all devices
GET    /api/devices/:id        # Get single device
POST   /api/devices            # Add device
PUT    /api/devices/:id        # Update device
DELETE /api/devices/:id        # Delete device
GET    /api/devices/stats      # Device statistics
GET    /api/devices/:id/logs   # Device network logs
```

### Subscriptions
```
GET    /api/subscriptions               # Get all subscriptions
GET    /api/subscriptions/:id           # Get single subscription
POST   /api/subscriptions               # Create subscription
PUT    /api/subscriptions/:id           # Update subscription
DELETE /api/subscriptions/:id           # Delete subscription
GET    /api/subscriptions/expiring      # Get expiring subscriptions
```

### Payments
```
GET    /api/payments                    # Get all payments
GET    /api/payments/:id                # Get single payment
POST   /api/payments                    # Create payment
PUT    /api/payments/:id                # Update payment
PUT    /api/payments/:id/process        # Process payment
DELETE /api/payments/:id                # Delete payment
GET    /api/payments/stats              # Payment statistics
GET    /api/payments/revenue/monthly    # Monthly revenue report
```

### Alerts
```
GET    /api/alerts                      # Get all alerts
GET    /api/alerts/:id                  # Get single alert
POST   /api/alerts                      # Create alert
PUT    /api/alerts/:id/acknowledge      # Acknowledge alert
PUT    /api/alerts/:id/resolve          # Resolve alert
PUT    /api/alerts/:id/dismiss          # Dismiss alert
DELETE /api/alerts/:id                  # Delete alert
GET    /api/alerts/stats                # Alert statistics
```

### Bandwidth
```
GET    /api/bandwidth                           # Get bandwidth usage
GET    /api/bandwidth/:id                       # Get single record
POST   /api/bandwidth                           # Create record
GET    /api/bandwidth/customer/:id/summary     # Customer bandwidth summary
GET    /api/bandwidth/top                       # Top bandwidth consumers
```

## 🔧 Configuration

### Environment Variables

**Backend** (`backend/.env`):
```env
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_PORT=3307
DB_NAME=nocman_db
DB_USER=nocman_user
DB_PASSWORD=your_secure_password
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_32_char_secret_key
JWT_EXPIRE=7d
```

**Docker** (`docker/.env`):
```env
MYSQL_ROOT_PASSWORD=secure_root_password
MYSQL_DATABASE=nocman_db
MYSQL_USER=nocman_user
MYSQL_PASSWORD=your_secure_password
REDIS_PASSWORD=secure_redis_password
```

## 🐳 Docker Services

**Akses Docker Services:**
- **MariaDB**: `localhost:3307`
- **Redis**: `localhost:6379`
- **phpMyAdmin**: http://localhost:8081
  - Server: `nocman_mariadb`
  - Username: `nocman_user`
  - Password: sesuai `docker/.env`

**Docker Commands:**
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart service
docker-compose restart mariadb

# Remove all data (WARNING: deletes all data!)
docker-compose down -v
```

## 🧪 Testing

```bash
# Basic API test
./test-api.sh

# Integration test
./test-integration.sh

# Manual testing dengan curl
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 📈 Monitoring

### Built-in Services

1. **Device Monitoring**
   - Automatic ping checks setiap 60 detik
   - Generate alerts untuk device offline
   - Network log history

2. **Billing Automation**
   - Overdue payment check: Daily at 9 AM
   - Upcoming payment reminder: Daily at 8 AM
   - Expiring subscription check: Daily at 7 AM
   - Auto-expire subscriptions: Daily at midnight

### Logs

```bash
# Server logs
npm run dev  # dengan nodemon (auto-reload)

# Docker logs
docker-compose logs -f mariadb
docker-compose logs -f redis
```

## 🚢 Deployment

Lihat [DEPLOYMENT.md](DEPLOYMENT.md) untuk panduan deployment lengkap ke:
- VPS (Ubuntu/Debian)
- Cloud platforms (AWS, DigitalOcean, etc)
- Production best practices

**Quick Production Setup:**
```bash
# Set NODE_ENV
export NODE_ENV=production

# Install dependencies (production only)
npm ci --production

# Start with PM2
npm install -g pm2
pm2 start src/index.js --name nocman-api
pm2 startup
pm2 save
```

## 🔒 Security Considerations

- ✅ JWT token-based authentication
- ✅ Password hashing dengan bcrypt
- ✅ Environment variables untuk sensitive data
- ✅ CORS configuration
- ✅ SQL injection prevention (Sequelize ORM)
- ✅ Input validation
- ⚠️ Change default passwords setelah instalasi
- ⚠️ Use HTTPS di production
- ⚠️ Implement rate limiting (optional)
- ⚠️ Regular security updates

## 🤝 Contributing

Contributions welcome! Silakan:

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Authors

- **Initial work** - Development & Migration to MariaDB

## 🙏 Acknowledgments

- Express.js community
- Sequelize ORM documentation
- Docker community
- All open-source contributors

## 📞 Support

Jika mengalami masalah:

1. Check [Issues](https://github.com/your-username/nocman/issues)
2. Create new issue dengan detail error
3. Sertakan:
   - Node.js version
   - OS information
   - Error logs
   - Steps to reproduce

## 🗺️ Roadmap

- [ ] Frontend dashboard (React/Next.js)
- [ ] Real-time monitoring dengan WebSocket
- [ ] Email notification integration
- [ ] SMS notification (Twilio/Nexmo)
- [ ] WhatsApp integration
- [ ] PDF invoice generation
- [ ] Multi-tenant support
- [ ] Grafana/Prometheus integration
- [ ] Mobile app (React Native)
- [ ] Advanced SNMP monitoring
- [ ] Network topology visualization
- [ ] Automated backup system

---

**Made with ❤️ for ISP Network Operations**
