# 🔄 Migrasi ke MariaDB/MySQL - Selesai!

## ✅ Yang Sudah Dikerjakan

Aplikasi NOC Assistant backend telah dipersiapkan untuk menggunakan **MariaDB/MySQL** sebagai database utama, menggantikan MongoDB.

### 1. Infrastructure Setup (Docker) ✅

**Lokasi**: `docker/`

```
docker/
├── docker-compose.yml   # MariaDB, Redis, phpMyAdmin
├── init.sql            # Database initialization  
└── README.md           # Docker documentation
```

**Services**:
- 🗄️ **MariaDB 10.11** - Database utama (Port 3306)
- 💾 **Redis 7** - Cache & session (Port 6379)
- 🌐 **phpMyAdmin** - Database management UI (Port 8080)

**Quick Start**:
```bash
cd docker
docker-compose up -d
```

### 2. Backend Configuration ✅

**Dependencies Updated**:
- ❌ Removed: `mongoose`, `snmp-native`
- ✅ Added: `sequelize`, `mysql2`, `redis`, `moment-timezone`

**Config Files**:
- ✅ `src/config/database.js` - Sequelize connection
- ✅ `src/config/redis.js` - Redis client
- ✅ `.env` & `.env.example` - MariaDB credentials

**Environment Variables**:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=nocman_db
DB_USER=nocman_user
DB_PASSWORD=nocman_pass_2024

REDIS_ENABLED=true
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=nocman_redis_2024
```

### 3. Documentation ✅

Dokumentasi lengkap telah dibuat:

| File | Deskripsi |
|------|-----------|
| `README.md` | Project overview (updated) |
| `QUICKSTART.md` | Quick start guide (updated) |
| `MIGRATION_GUIDE.md` | **Detailed migration guide** |
| `SUMMARY.md` | Migration summary & checklist |
| `backend/README.md` | Backend API docs |
| `docker/README.md` | Docker usage guide |

### 4. Backup ✅

Model lama (Mongoose) telah di-backup ke:
```
backend/src/models_backup_mongoose/
```

### 5. Utilities ✅

**Test Scripts**:
- `test-database.sh` - Test Docker services
- `setup.sh` - Setup script (updated)

## ⚠️ Yang Perlu Dilanjutkan

### Priority 1: Models Implementation 🔴

**8 Model files** perlu dibuat ulang dengan Sequelize:

```javascript
// Template: src/models/User.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  // ... other fields
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

module.exports = User;
```

**Models to Create**:
1. ⚠️ `User.js` - Authentication
2. ⚠️ `Customer.js` - Customer data
3. ⚠️ `Device.js` - Network devices
4. 🟡 `Subscription.js` - Subscriptions
5. 🟡 `Payment.js` - Billing
6. 🟡 `Alert.js` - Alerts
7. 🟢 `NetworkLog.js` - Logs
8. 🟢 `BandwidthUsage.js` - Usage tracking
9. ⚠️ `index.js` - Export & relationships

**Reference**: Lihat `models_backup_mongoose/` untuk field definitions

### Priority 2: Controllers Update 🟡

Update query syntax dari Mongoose ke Sequelize:

```javascript
// Before (Mongoose)
const users = await User.find({ status: 'active' })
  .sort('-createdAt')
  .limit(10);

// After (Sequelize)
const users = await User.findAll({
  where: { status: 'active' },
  order: [['createdAt', 'DESC']],
  limit: 10
});
```

**Files to Update**:
- `authController.js` ⚠️
- `userController.js` ⚠️
- `customerController.js` ⚠️
- `deviceController.js` ⚠️
- `subscriptionController.js` 🟡
- `paymentController.js` 🟡
- `alertController.js` 🟡
- `bandwidthController.js` 🟢

### Priority 3: Services & Scripts 🟢

- Update `services/monitoringService.js`
- Update `services/billingService.js`
- Update `scripts/seedAdmin.js`
- Update `scripts/seedData.js`
- Create `scripts/syncDatabase.js`

### Priority 4: Main Server 🟢

Update `src/index.js`:
```javascript
// Before
const connectDB = require('./config/database');
connectDB();

// After
const { connectDB } = require('./config/database');
connectDB();
```

## 📖 Referensi Database

File SQL yang Anda berikan (`MixRadiusDB_Fastkho_2025-11-27_173528.sql`) digunakan sebagai referensi untuk:

### NAS Table → Device Model
```sql
nas (
  id, nasname, shortname, type, 
  ports, secret, server, community
)
```
Maps to Device model dengan fields yang sesuai.

### RadAcct Table → NetworkLog Model
```sql
radacct (
  radacctid, acctsessionid, username,
  nasipaddress, framedipaddress,
  acctstarttime, acctstoptime,
  acctinputoctets, acctoutputoctets
)
```
Maps to NetworkLog untuk tracking bandwidth & sessions.

## 🚀 Cara Melanjutkan Development

### Step 1: Test Database Connection

```bash
# Test Docker services
./test-database.sh

# Should show:
# ✅ MariaDB connection successful
# ✅ Redis connection successful
```

### Step 2: Create Models

Mulai dengan model User (paling prioritas):

```bash
cd backend/src/models
# Create User.js, Customer.js, Device.js
# Then create index.js with relationships
```

Reference:
- Template ada di `MIGRATION_GUIDE.md`
- Old models di `models_backup_mongoose/`
- Sequelize docs: https://sequelize.org/

### Step 3: Update Controllers

```bash
cd backend/src/controllers
# Update authController.js first (for testing login)
```

### Step 4: Create Sync Script

```bash
# Create scripts/syncDatabase.js
const { sequelize } = require('../src/models');

async function syncDatabase() {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

syncDatabase();
```

### Step 5: Test

```bash
# Sync database
npm run db:sync

# Seed admin user
npm run seed:admin

# Start server
npm run dev

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 📚 Documentation Files

Read these for detailed information:

1. **`MIGRATION_GUIDE.md`** 📘
   - Complete migration guide
   - Model templates
   - Sequelize patterns
   - Troubleshooting

2. **`SUMMARY.md`** 📋
   - Migration checklist
   - Current status
   - Next steps

3. **`QUICKSTART.md`** 🚀
   - Quick start guide
   - Installation steps
   - Common commands

4. **`docker/README.md`** 🐳
   - Docker commands
   - Database access
   - Backup/restore

## 🎯 Checklist untuk Developer

- [ ] Baca `MIGRATION_GUIDE.md`
- [ ] Start Docker: `cd docker && docker-compose up -d`
- [ ] Test connection: `./test-database.sh`
- [ ] Create 8 models dengan Sequelize
- [ ] Create `models/index.js` dengan relationships
- [ ] Update 8 controllers
- [ ] Update 2 services
- [ ] Create `scripts/syncDatabase.js`
- [ ] Update seed scripts
- [ ] Test authentication flow
- [ ] Test CRUD operations
- [ ] Test monitoring service
- [ ] Test billing automation

## 💡 Tips

### Quick Database Access

```bash
# MariaDB CLI
docker exec -it nocman_mariadb mysql -u nocman_user -pnocman_pass_2024 nocman_db

# Redis CLI  
docker exec -it nocman_redis redis-cli -a nocman_redis_2024

# phpMyAdmin
open http://localhost:8080
```

### Quick Reset

```bash
# Reset everything
cd docker
docker-compose down -v
docker-compose up -d

# Wait then sync
cd ../backend
npm run db:sync
npm run seed:admin
```

### View Logs

```bash
cd docker

# All services
docker-compose logs -f

# Specific service
docker-compose logs -f mariadb
docker-compose logs -f redis
```

## 🆘 Need Help?

1. Check **`MIGRATION_GUIDE.md`** for detailed instructions
2. Check **`SUMMARY.md`** for current status
3. Review backup models in `models_backup_mongoose/`
4. Check Docker logs: `docker-compose logs`
5. Test database: `./test-database.sh`

## 📊 Progress Status

```
Backend Infrastructure:     ████████████████████ 100%
Docker Setup:              ████████████████████ 100%
Configuration:             ████████████████████ 100%
Documentation:             ████████████████████ 100%
Models Implementation:     ░░░░░░░░░░░░░░░░░░░░   0%
Controllers Update:        ░░░░░░░░░░░░░░░░░░░░   0%
Services Update:           ░░░░░░░░░░░░░░░░░░░░   0%
Testing:                   ░░░░░░░░░░░░░░░░░░░░   0%
```

**Overall Progress**: 40% ✅

---

**Ready to Continue**: Infrastructure siap, tinggal implement models & controllers!  
**Next Action**: Buat 8 model files dengan Sequelize  
**Estimated Time**: 2-3 jam untuk complete migration

🚀 **Happy Coding!**
