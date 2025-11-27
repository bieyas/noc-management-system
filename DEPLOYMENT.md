# 🚀 Deployment Guide - NOC Management System

Panduan lengkap deployment NOC Assistant ke production environment.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [VPS Setup (Ubuntu/Debian)](#vps-setup)
3. [Database Configuration](#database-configuration)
4. [Application Deployment](#application-deployment)
5. [Nginx Configuration](#nginx-configuration)
6. [SSL Certificate (Let's Encrypt)](#ssl-certificate)
7. [Process Management (PM2)](#process-management)
8. [Monitoring & Logging](#monitoring--logging)
9. [Backup Strategy](#backup-strategy)
10. [Security Hardening](#security-hardening)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

**Server Requirements:**
- Ubuntu 20.04/22.04 LTS atau Debian 11/12
- Minimum 2GB RAM (4GB recommended)
- 20GB disk space
- Root atau sudo access
- Domain name (optional, untuk SSL)

**Software Requirements:**
- Node.js v18+ LTS
- MariaDB v10.11+
- Redis v7+
- Nginx (reverse proxy)
- PM2 (process manager)
- Docker & Docker Compose (optional)

---

## VPS Setup

### 1. Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Node.js

```bash
# Install NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version  # should be v20.x.x
npm --version
```

### 3. Install MariaDB

```bash
# Install MariaDB
sudo apt install -y mariadb-server mariadb-client

# Secure installation
sudo mysql_secure_installation
# Set root password
# Remove anonymous users: Y
# Disallow root login remotely: Y
# Remove test database: Y
# Reload privilege tables: Y

# Verify
sudo systemctl status mariadb
```

### 4. Install Redis

```bash
# Install Redis
sudo apt install -y redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
# Set: supervised systemd
# Set: bind 127.0.0.1 ::1
# Set: requirepass your_secure_redis_password

# Restart Redis
sudo systemctl restart redis
sudo systemctl enable redis

# Verify
redis-cli ping
# Response: PONG
```

### 5. Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable
sudo systemctl start nginx
sudo systemctl enable nginx

# Allow firewall
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 6. Install PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Setup PM2 startup
pm2 startup systemd
# Follow the command output
```

---

## Database Configuration

### Create Production Database

```bash
# Login to MariaDB
sudo mysql -u root -p

# Create database and user
CREATE DATABASE nocman_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'nocman_user'@'localhost' IDENTIFIED BY 'your_secure_password_here';
GRANT ALL PRIVILEGES ON nocman_db.* TO 'nocman_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Test connection
mysql -u nocman_user -p nocman_db
```

### Optimize MariaDB for Production

```bash
sudo nano /etc/mysql/mariadb.conf.d/50-server.cnf
```

Add/modify:
```ini
[mysqld]
max_connections = 200
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2
query_cache_size = 64M
query_cache_limit = 2M
```

Restart MariaDB:
```bash
sudo systemctl restart mariadb
```

---

## Application Deployment

### 1. Create App User

```bash
# Create dedicated user
sudo adduser nocman --disabled-password
sudo usermod -aG sudo nocman

# Switch to nocman user
sudo su - nocman
```

### 2. Clone Repository

```bash
# Clone from GitHub
cd /home/nocman
git clone https://github.com/your-username/nocman.git
cd nocman/backend
```

### 3. Configure Environment

```bash
# Copy environment file
cp .env.example .env

# Edit configuration
nano .env
```

**Production .env:**
```env
NODE_ENV=production
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=nocman_db
DB_USER=nocman_user
DB_PASSWORD=your_secure_database_password
DB_SYNC=false

REDIS_ENABLED=true
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_redis_password

JWT_SECRET=generate_32_char_random_secret_key_here
JWT_EXPIRE=7d

CORS_ORIGIN=https://yourdomain.com

PING_INTERVAL=60000
ALERT_CHECK_INTERVAL=300000
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Install Dependencies

```bash
# Install production dependencies
npm ci --production

# Or include dev dependencies for development
npm install
```

### 5. Setup Database

```bash
# Sync database tables
npm run db:sync

# Create admin user
npm run seed:admin

# Optional: Load sample data for testing
# npm run seed:data
```

### 6. Test Application

```bash
# Start in development mode
npm run dev

# Test API
curl http://localhost:5000/health

# If working, stop with Ctrl+C
```

---

## Process Management

### Configure PM2

```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'nocman-api',
    script: 'src/index.js',
    cwd: '/home/nocman/nocman/backend',
    instances: 2,  // or 'max' for all CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/home/nocman/logs/err.log',
    out_file: '/home/nocman/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '500M'
  }]
};
```

### Start with PM2

```bash
# Create logs directory
mkdir -p /home/nocman/logs

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
# Run the command that PM2 outputs

# Monitor
pm2 status
pm2 logs nocman-api
pm2 monit
```

### PM2 Commands

```bash
# Status
pm2 status

# Logs
pm2 logs nocman-api
pm2 logs nocman-api --lines 100

# Restart
pm2 restart nocman-api

# Stop
pm2 stop nocman-api

# Reload (zero-downtime)
pm2 reload nocman-api

# Monitor
pm2 monit

# Delete from PM2
pm2 delete nocman-api
```

---

## Nginx Configuration

### Create Nginx Config

```bash
sudo nano /etc/nginx/sites-available/nocman
```

```nginx
# Upstream Node.js backend
upstream nocman_backend {
    least_conn;
    server 127.0.0.1:5000 max_fails=3 fail_timeout=30s;
    keepalive 64;
}

# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/nocman_access.log;
    error_log /var/log/nginx/nocman_error.log;

    # Client body size limit
    client_max_body_size 10M;

    # API endpoints
    location /api {
        limit_req zone=api_limit burst=20 nodelay;

        proxy_pass http://nocman_backend;
        proxy_http_version 1.1;
        
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://nocman_backend;
        access_log off;
    }

    # Root
    location / {
        return 200 'NOC Management API is running';
        add_header Content-Type text/plain;
    }
}
```

### Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/nocman /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## SSL Certificate

### Install Certbot

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# - Enter email
# - Agree to terms
# - Choose redirect HTTP to HTTPS (recommended: 2)

# Test auto-renewal
sudo certbot renew --dry-run
```

### SSL Configuration (Auto-generated by Certbot)

Certbot akan otomatis mengupdate file nginx dengan SSL configuration.

Verify:
```bash
sudo nano /etc/nginx/sites-available/nocman
```

Should contain:
```nginx
listen 443 ssl;
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
```

---

## Monitoring & Logging

### PM2 Monitoring

```bash
# Install PM2 Plus (optional, untuk advanced monitoring)
pm2 link your_secret_key your_public_key

# Monitor
pm2 monit

# Web dashboard
pm2 web
```

### Log Rotation

```bash
# Install PM2 log rotate
pm2 install pm2-logrotate

# Configure
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

### System Monitoring

```bash
# Install htop
sudo apt install -y htop

# Monitor resources
htop

# Check disk space
df -h

# Check memory
free -h
```

---

## Backup Strategy

### Database Backup

Create backup script:
```bash
sudo nano /home/nocman/scripts/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/nocman/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="nocman_db"
DB_USER="nocman_user"
DB_PASS="your_password"

mkdir -p $BACKUP_DIR

# Backup
mysqldump -u$DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/nocman_$DATE.sql.gz

# Keep last 30 days
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: nocman_$DATE.sql.gz"
```

```bash
# Make executable
chmod +x /home/nocman/scripts/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
```

Add line:
```
0 2 * * * /home/nocman/scripts/backup-db.sh >> /home/nocman/logs/backup.log 2>&1
```

### Application Backup

```bash
# Backup entire application
cd /home/nocman
tar -czf nocman_backup_$(date +%Y%m%d).tar.gz nocman/

# Or use rsync to remote server
rsync -avz /home/nocman/nocman/ user@backup-server:/backups/nocman/
```

---

## Security Hardening

### 1. Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow essential ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# Check status
sudo ufw status
```

### 2. Fail2Ban

```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Configure
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Enable for SSH and Nginx
# [sshd]
# enabled = true
# [nginx-http-auth]
# enabled = true

# Restart
sudo systemctl restart fail2ban
sudo systemctl enable fail2ban
```

### 3. Secure MariaDB

```bash
# Disable remote root login
sudo mysql -e "DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');"
sudo mysql -e "FLUSH PRIVILEGES;"
```

### 4. Update Environment Permissions

```bash
# Secure .env file
chmod 600 /home/nocman/nocman/backend/.env
chown nocman:nocman /home/nocman/nocman/backend/.env
```

---

## Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs nocman-api --lines 100

# Check port availability
sudo netstat -tulpn | grep 5000

# Check environment variables
pm2 env nocman-api

# Restart
pm2 restart nocman-api
```

### Database Connection Issues

```bash
# Test connection
mysql -u nocman_user -p nocman_db

# Check MariaDB status
sudo systemctl status mariadb

# Check MariaDB logs
sudo tail -f /var/log/mysql/error.log

# Restart MariaDB
sudo systemctl restart mariadb
```

### Redis Connection Issues

```bash
# Test Redis
redis-cli -a your_redis_password ping

# Check Redis status
sudo systemctl status redis

# Check Redis logs
sudo tail -f /var/log/redis/redis-server.log

# Restart Redis
sudo systemctl restart redis
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/nocman_error.log

# Restart Nginx
sudo systemctl restart nginx
```

### High CPU/Memory Usage

```bash
# Check processes
htop

# PM2 memory restart
pm2 restart nocman-api

# Check logs for errors
pm2 logs nocman-api --lines 200

# Reduce PM2 instances if needed
pm2 scale nocman-api 1
```

---

## Post-Deployment Checklist

- [ ] Server updated and secured
- [ ] MariaDB installed and configured
- [ ] Redis installed and configured
- [ ] Application deployed and running via PM2
- [ ] Nginx configured as reverse proxy
- [ ] SSL certificate installed (HTTPS)
- [ ] Firewall configured (UFW)
- [ ] Fail2Ban installed
- [ ] Database backup automated
- [ ] Log rotation configured
- [ ] Monitoring setup (PM2 monit)
- [ ] Health check endpoint accessible
- [ ] Admin password changed from default
- [ ] Environment variables secured
- [ ] Domain DNS configured
- [ ] Email notifications configured (optional)
- [ ] Integration tests passing

---

## Maintenance Commands

```bash
# Update application
cd /home/nocman/nocman
git pull origin main
cd backend
npm ci --production
pm2 reload nocman-api

# View logs
pm2 logs nocman-api
tail -f /var/log/nginx/nocman_error.log

# Restart services
pm2 restart nocman-api
sudo systemctl restart nginx
sudo systemctl restart mariadb
sudo systemctl restart redis

# Check status
pm2 status
sudo systemctl status nginx
sudo systemctl status mariadb
sudo systemctl status redis

# Monitor resources
htop
df -h
free -h
```

---

**Deployment Completed! 🎉**

Your NOC Management System is now running in production.

Access your API at: `https://yourdomain.com/api`
