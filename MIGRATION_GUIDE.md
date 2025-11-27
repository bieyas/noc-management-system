# Migration Guide: MongoDB to MariaDB/MySQL

## Status Migrasi Backend

✅ Docker setup (MariaDB + Redis + phpMyAdmin)  
✅ Package.json updated (Sequelize, mysql2, redis)  
✅ Database config updated  
✅ Environment variables updated  
⚠️ **Models perlu direfactor ke Sequelize** (IN PROGRESS)  
⚠️ **Controllers perlu disesuaikan** (PENDING)  
⚠️ **Seed scripts perlu disesuaikan** (PENDING)

## Quick Start - Gunakan Database Baru

### 1. Start Docker Services

```bash
cd docker
docker-compose up -d
```

Verify services running:
```bash
docker-compose ps
```

Access phpMyAdmin: http://localhost:8080
- Username: root
- Password: nocman_root_2024

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Jalankan Database Sync (Akan dibuat)

```bash
npm run db:sync
```

### 4. Seed Database

```bash
npm run seed:admin
# atau
npm run seed:data
```

### 5. Start Server

```bash
npm run dev
```

## Yang Sudah Selesai

### 1. Docker Configuration (`docker/`)
- `docker-compose.yml` - MariaDB, Redis, phpMyAdmin
- `init.sql` - Initial database setup
- `README.md` - Docker documentation

### 2. Package Dependencies Updated
- ❌ Removed: `mongoose`, `snmp-native`
- ✅ Added: `sequelize`, `mysql2`, `redis`, `moment-timezone`

### 3. Database Configuration
- `src/config/database.js` - Sequelize connection
- `src/config/redis.js` - Redis client
- `.env` - Updated dengan MariaDB credentials

### 4. Models Structure (Perlu Implementation)

File yang perlu dibuat dengan Sequelize:
- `src/models/User.js`
- `src/models/Customer.js` 
- `src/models/Subscription.js`
- `src/models/Payment.js`
- `src/models/Device.js`
- `src/models/NetworkLog.js`
- `src/models/Alert.js`
- `src/models/BandwidthUsage.js`
- `src/models/index.js` - Export semua models dengan relationships

## Referensi Database Structure

Dari file `MixRadiusDB_Fastkho_2025-11-27_173528.sql`:

### NAS Table (Network Access Server)
```sql
CREATE TABLE `nas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nasname` varchar(128) NOT NULL,
  `shortname` varchar(32),
  `type` varchar(30) DEFAULT 'other',
  `ports` int(5),
  `secret` varchar(60) NOT NULL DEFAULT 'secret',
  `server` varchar(64),
  `community` varchar(50),
  `description` varchar(200) DEFAULT 'RADIUS Client',
  PRIMARY KEY (`id`),
  KEY `nasname` (`nasname`)
) ENGINE=InnoDB;
```

### RadAcct Table (Accounting/Logging)
```sql
CREATE TABLE `radacct` (
  `radacctid` bigint(21) unsigned NOT NULL AUTO_INCREMENT,
  `acctsessionid` varchar(64) NOT NULL DEFAULT '',
  `acctuniqueid` varchar(32) NOT NULL DEFAULT '',
  `username` varchar(64) NOT NULL DEFAULT '',
  `nasipaddress` varchar(15) NOT NULL DEFAULT '',
  `nasportid` varchar(32),
  `framedipaddress` varchar(15) NOT NULL DEFAULT '',
  `acctstarttime` datetime,
  `acctstoptime` datetime,
  `acctsessiontime` int(12) unsigned,
  `acctinputoctets` bigint(20),
  `acctoutputoctets` bigint(20),
  `calledstationid` varchar(50) NOT NULL DEFAULT '',
  `callingstationid` varchar(50) NOT NULL DEFAULT '',
  PRIMARY KEY (`radacctid`),
  UNIQUE KEY `acctuniqueid` (`acctuniqueid`),
  KEY `username` (`username`),
  KEY `nasipaddress` (`nasipaddress`)
) ENGINE=InnoDB;
```

## Mapping Table Structure

### Customer Management
| Mongoose | Sequelize/MySQL |
|----------|-----------------|
| ObjectId | INT AUTO_INCREMENT |
| String | VARCHAR |
| Date | DATETIME/TIMESTAMP |
| Mixed/Object | JSON |
| ref | FOREIGN KEY |

### Field Mapping
```javascript
// Mongoose
customerId: String

// Sequelize
customerId: {
  type: DataTypes.STRING(50),
  allowNull: false,
  unique: true
}
```

## Next Steps untuk Developer

### 1. Complete Model Files

Buat semua 8 model files dengan Sequelize syntax. Contoh:

```javascript
// src/models/Customer.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  customerId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  // ... fields lainnya
}, {
  tableName: 'customers',
  timestamps: true
});

module.exports = Customer;
```

### 2. Update Controllers

Ganti Mongoose query dengan Sequelize:

```javascript
// OLD (Mongoose)
const customers = await Customer.find().sort('-createdAt');

// NEW (Sequelize)
const customers = await Customer.findAll({
  order: [['createdAt', 'DESC']]
});
```

### 3. Update Service Files

- `monitoringService.js` - Tetap sama (ping logic)
- `billingService.js` - Update query ke Sequelize

### 4. Update Seed Scripts

Ganti dari Mongoose ke Sequelize:

```javascript
// OLD
await User.create({...});

// NEW  
await User.create({...}); // Sama, tapi import dari models/index.js
```

### 5. Create Migration Script

Buat `scripts/syncDatabase.js`:
```javascript
const { sequelize } = require('../src/models');

async function syncDatabase() {
  await sequelize.sync({ force: false, alter: true });
  console.log('Database synchronized');
}

syncDatabase();
```

## Common Sequelize Patterns

### Find All
```javascript
const records = await Model.findAll({
  where: { status: 'active' },
  include: ['relatedModel'],
  order: [['createdAt', 'DESC']],
  limit: 10
});
```

### Find One
```javascript
const record = await Model.findOne({
  where: { id: 1 }
});
```

### Create
```javascript
const record = await Model.create({
  field1: 'value1',
  field2: 'value2'
});
```

### Update
```javascript
await Model.update(
  { status: 'inactive' },
  { where: { id: 1 } }
);
```

### Delete
```javascript
await Model.destroy({
  where: { id: 1 }
});
```

### Count
```javascript
const count = await Model.count({
  where: { status: 'active' }
});
```

### Aggregate
```javascript
const stats = await Model.findAll({
  attributes: [
    'status',
    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
  ],
  group: ['status']
});
```

## Database Connection Strings

### MariaDB (Docker)
```
Host: localhost
Port: 3306
Database: nocman_db
User: nocman_user
Password: nocman_pass_2024
```

### Redis (Docker)
```
Host: localhost
Port: 6379
Password: nocman_redis_2024
```

## Troubleshooting

### Port Conflicts
Edit `docker/docker-compose.yml` ports jika bentrok:
```yaml
ports:
  - "3307:3306"  # Change 3306 to 3307
```

### Connection Refused
```bash
# Check if Docker containers are running
docker-compose ps

# View logs
docker-compose logs mariadb
```

### Database Not Found
```bash
# Connect to MariaDB and create database
docker exec -it nocman_mariadb mysql -u root -p
# Enter password: nocman_root_2024

CREATE DATABASE nocman_db;
```

## Files to Review/Edit

1. ✅ `docker/docker-compose.yml`
2. ✅ `backend/package.json`
3. ✅ `backend/.env`
4. ✅ `backend/src/config/database.js`
5. ✅ `backend/src/config/redis.js`
6. ⚠️ `backend/src/models/*.js` (8 files - NEED TO CREATE)
7. ⚠️ `backend/src/controllers/*.js` (8 files - NEED TO UPDATE)
8. ⚠️ `backend/src/services/*.js` (2 files - NEED TO UPDATE)
9. ⚠️ `backend/scripts/seedAdmin.js` (NEED TO UPDATE)
10. ⚠️ `backend/scripts/seedData.js` (NEED TO UPDATE)

## Production Considerations

1. **Backup Strategy**: Setup automated backups untuk MariaDB
2. **Connection Pooling**: Already configured in sequelize config
3. **Redis Persistence**: Already enabled in docker-compose (AOF)
4. **Environment Variables**: Never commit `.env` file
5. **Database Migrations**: Use Sequelize migrations untuk production
6. **Indexing**: Add proper indexes untuk query performance

## Contact/Support

Untuk melanjutkan development:
1. Implement all 8 model files
2. Update controllers untuk Sequelize syntax
3. Test dengan seed data
4. Deploy dengan Docker

---

**Note**: File ini adalah guide untuk melanjutkan migrasi dari MongoDB ke MariaDB/MySQL.
Backup lama ada di `backend/src/models_backup_mongoose/`.
