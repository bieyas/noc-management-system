# Quick Start Guide - NOC Management System

## Prerequisites

Sebelum memulai, pastikan Anda telah menginstall:

1. **Node.js** (v14 atau lebih baru)
   - Download dari: https://nodejs.org/
   - Verifikasi: `node --version` dan `npm --version`

2. **Docker & Docker Compose**
   - Download dari: https://www.docker.com/get-started
   - Verifikasi: `docker --version` dan `docker-compose --version`

## Installation

### 1. Clone atau Download Project

```bash
cd /home/basuki/nocman
```

### 2. Start Database Services

```bash
cd docker
docker-compose up -d
```

Verifikasi services berjalan:

```bash
docker-compose ps
```

Output:
```
NAME                  STATUS    PORTS
nocman_mariadb        Up        0.0.0.0:3306->3306/tcp
nocman_redis          Up        0.0.0.0:6379->6379/tcp
nocman_phpmyadmin     Up        0.0.0.0:8080->80/tcp
```

**Access URLs:**
- MariaDB: `localhost:3306`
- Redis: `localhost:6379`
- phpMyAdmin: http://localhost:8080
  - Username: `root`
  - Password: `nocman_root_2024`

### 3. Setup Environment Variables

File `.env` sudah dibuat otomatis. Review dan edit jika perlu:

```bash
nano backend/.env
```

### 4. Start MongoDB

Pastikan MongoDB berjalan:

```bash
# Cek status MongoDB
sudo systemctl status mongodb

# Start MongoDB jika belum berjalan
sudo systemctl start mongodb

# Atau jalankan manual
mongod
```

### 5. Database Setup

**⚠️ Important**: Models masih dalam proses migrasi ke Sequelize.  
Lihat `MIGRATION_GUIDE.md` untuk detail lengkap.

Setelah models selesai, jalankan:

```bash
# Sync database (create tables)
npm run db:sync

# Seed admin user
npm run seed:admin
```

Output:
```
✅ Admin user created successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Username: admin
Email: admin@nocman.com
Password: admin123
Role: admin
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Optional - Sample Data (untuk testing)**
```bash
npm run seed:data
```

This will create:
- 3 users (admin, staff, technician)
- 2 customers
- 2 subscriptions
- 2 pending payments
- 3 network devices

### 6. Start Server

**Development mode (dengan auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server akan berjalan di: `http://localhost:5000`

## Testing the API

### 1. Health Check

```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "success": true,
  "message": "NOC Management API is running",
  "timestamp": "2024-11-27T..."
}
```

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "...",
    "username": "admin",
    "email": "admin@nocman.com",
    "fullName": "Administrator",
    "role": "admin"
  }
}
```

**Simpan token untuk request selanjutnya!**

### 3. Get Dashboard Stats

```bash
curl http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Get All Devices

```bash
curl http://localhost:5000/api/devices \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Default Login Credentials

### Admin User
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Admin (Full access)

### Staff User (jika menggunakan seed:data)
- **Username**: `staff`
- **Password**: `staff123`
- **Role**: Staff (Customer & billing management)

### Technician User (jika menggunakan seed:data)
- **Username**: `tech`
- **Password**: `tech123`
- **Role**: Technician (Device monitoring)

⚠️ **PENTING**: Ganti password default setelah login pertama kali!

## API Testing dengan Postman

1. Import collection file: `backend/postman_collection.json`
2. Set variable `baseUrl` = `http://localhost:5000`
3. Login untuk mendapatkan token
4. Set variable `token` dengan token yang didapat
5. Test endpoints lainnya

## Monitoring Features

### Automated Services

Saat server berjalan, otomatis menjalankan:

1. **Device Monitoring** (setiap 1 menit)
   - Ping semua devices
   - Update status (online/offline)
   - Generate alerts

2. **Billing Automation** (scheduled daily)
   - 07:00 - Check expiring subscriptions
   - 08:00 - Check upcoming payments
   - 09:00 - Check overdue payments
   - 00:00 - Auto-expire subscriptions

### Check Logs

Monitoring logs akan muncul di console:

```
Monitoring 3 devices...
Device monitoring completed
Running upcoming payment check...
```

## Common Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Create admin user
npm run seed:admin

# Create sample data
npm run seed:data

# Run tests
npm test
```

## Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solution**: Check if Docker containers are running
```bash
cd docker
docker-compose ps

# Start containers if not running
docker-compose up -d

# Check logs
docker-compose logs mariadb
```

### Redis Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution**: Disable Redis in `.env` if not needed
```env
REDIS_ENABLED=false
```

Or start Redis container:
```bash
cd docker
docker-compose up -d redis
```

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution**: Change PORT in `.env` or kill process
```bash
# Find process
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=5001
```

### Docker Port Conflicts

```
Error: Bind for 0.0.0.0:3306 failed: port is already allocated
```

**Solution**: Edit `docker/docker-compose.yml`
```yaml
services:
  mariadb:
    ports:
      - "3307:3306"  # Change external port
```

### Database Not Synced

**Solution**: Run database sync
```bash
npm run db:sync
```

### Migration Issues

**Solution**: Check migration guide
```bash
cat MIGRATION_GUIDE.md
```

## Next Steps

1. ✅ Backend API sudah berjalan
2. 📱 Develop Frontend Dashboard (React/Vue.js)
3. 🔔 Setup Email notifications
4. 📊 Add advanced analytics
5. 🔌 Integrate dengan MikroTik API
6. 📱 Mobile app development

## Support

Jika ada masalah, silakan:
1. Check logs di terminal
2. Periksa MongoDB status
3. Verifikasi environment variables
4. Review documentation di `backend/README.md`

## Dokumentasi Lengkap

- Backend API: `backend/README.md`
- Models Documentation: Lihat files di `backend/src/models/`
- API Endpoints: Lihat files di `backend/src/routes/`
- Services: Lihat files di `backend/src/services/`

---

**Happy Coding! 🚀**
