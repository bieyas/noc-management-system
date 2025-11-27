# ⚡ Quick Start Guide

**NOC Management System - Get running in 5 minutes!**

## 🎯 For New Users Cloning This Repository

### Step 1: Clone Repository (1 min)
```bash
git clone https://github.com/YOUR-USERNAME/nocman.git
cd nocman
```

### Step 2: Start Docker Services (2 min)
```bash
cd docker
cp .env.example .env

# Edit passwords di .env (IMPORTANT!)
nano .env

# Start services
docker-compose up -d

# Verify
docker-compose ps
```

**Services Running:**
- ✅ MariaDB → `localhost:3307`
- ✅ Redis → `localhost:6379`
- ✅ phpMyAdmin → `http://localhost:8081`

### Step 3: Setup Backend (1 min)
```bash
cd ../backend
cp .env.example .env

# Edit configuration
nano .env
# MUST change:
# - DB_PASSWORD (same as docker/.env)
# - REDIS_PASSWORD (same as docker/.env)
# - JWT_SECRET (generate random 32+ chars)

# Install dependencies
npm install
```

### Step 4: Initialize Database (30 sec)
```bash
# Create tables
npm run db:sync

# Create admin user (username: admin, password: admin123)
npm run seed:admin

# Optional: Load sample data for testing
npm run seed:data
```

### Step 5: Start Server (10 sec)
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

**Server running at:** `http://localhost:5000`

### Step 6: Test API (10 sec)
```bash
# Health check
curl http://localhost:5000/health

# Run integration tests
chmod +x test-integration.sh
./test-integration.sh

# Login test
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 🎉 Success! You're Running!

**What's available:**

| Endpoint | Purpose | Authentication |
|----------|---------|----------------|
| `POST /api/auth/login` | Login & get JWT token | ❌ No |
| `GET /api/customers` | List all customers | ✅ Required |
| `GET /api/devices` | List network devices | ✅ Required |
| `GET /api/subscriptions` | List subscriptions | ✅ Required |
| `GET /api/payments` | List payments | ✅ Required |
| `GET /api/alerts` | List alerts | ✅ Required |
| `GET /api/bandwidth` | Bandwidth usage data | ✅ Required |

**Sample Credentials:**
- Username: `admin`
- Password: `admin123`

⚠️ **Change admin password immediately!**

---

## 🔧 Configuration Quick Reference

### Environment Variables (`.env`)

**Must Configure:**
```env
DB_PASSWORD=your_secure_password      # Same as docker/.env
REDIS_PASSWORD=your_secure_password   # Same as docker/.env
JWT_SECRET=random_32_char_secret      # Generate new!
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Optional:**
```env
NODE_ENV=production          # For production
PORT=5000                    # Change if port conflict
CORS_ORIGIN=your-domain.com  # For production
```

### Docker Ports

Default ports (change in `docker/docker-compose.yml` if conflict):
```yaml
MariaDB:    3307:3306
Redis:      6379:6379
phpMyAdmin: 8081:80
```

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check Docker services
cd docker && docker-compose ps

# Check MariaDB logs
docker-compose logs mariadb

# Restart services
docker-compose restart
```

### Port Already in Use
```bash
# Check what's using port 5000
sudo lsof -i :5000

# Kill process or change PORT in .env
```

### JWT Token Invalid
```bash
# Make sure JWT_SECRET matches in .env
# Re-login to get new token
```

### Node Modules Error
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Documentation Links

- **Full README**: [README.md](README.md)
- **Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Changelog**: [CHANGELOG.md](CHANGELOG.md)
- **GitHub Push Instructions**: [GITHUB_PUSH.md](GITHUB_PUSH.md)

---

## 🎯 Next Steps

1. **Change Admin Password**
   ```bash
   # Login and change via API or database
   ```

2. **Configure Monitoring**
   - Edit `PING_INTERVAL` in .env (default: 60 seconds)
   - Check device status in logs

3. **Setup Cron Jobs** (already running):
   - Device monitoring: Every 60 seconds
   - Billing checks: Daily at 9 AM
   - Payment reminders: Daily at 8 AM

4. **Access phpMyAdmin**
   - URL: http://localhost:8081
   - Server: `nocman_mariadb`
   - Username: from `docker/.env`
   - Password: from `docker/.env`

5. **Production Deployment**
   - Follow [DEPLOYMENT.md](DEPLOYMENT.md)
   - Setup SSL certificate
   - Configure Nginx reverse proxy
   - Use PM2 for process management

---

## 💡 Pro Tips

**Development:**
```bash
# Watch logs in real-time
npm run dev

# Run single test endpoint
curl -X GET http://localhost:5000/api/devices \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Production:**
```bash
# Use PM2 for process management
npm install -g pm2
pm2 start src/index.js --name nocman-api
pm2 save
pm2 startup
```

**Database Backup:**
```bash
# Export database
docker exec nocman_mariadb mysqldump -u nocman_user -p nocman_db > backup.sql

# Import database
docker exec -i nocman_mariadb mysql -u nocman_user -p nocman_db < backup.sql
```

---

## ✅ Verification Checklist

- [ ] Docker services running
- [ ] Database tables created (8 tables)
- [ ] Admin user exists
- [ ] Server responds to /health
- [ ] Login returns JWT token
- [ ] API endpoints accessible
- [ ] Sample data loaded (optional)
- [ ] Integration tests passing

**All green?** You're ready to go! 🚀

---

## 🆘 Need Help?

- **Check Logs**: `npm run dev` or `docker-compose logs`
- **Read Full Docs**: [README.md](README.md)
- **Issues**: Open issue on GitHub
- **Deployment**: Follow [DEPLOYMENT.md](DEPLOYMENT.md)

**Happy coding! 🎉**
