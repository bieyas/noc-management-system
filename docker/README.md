# Docker Database Setup

Folder ini berisi konfigurasi Docker untuk menjalankan database dan services pendukung.

## Services

1. **MariaDB** - Database utama (Port 3306)
2. **Redis** - Cache dan session storage (Port 6379)
3. **phpMyAdmin** - Web-based database management (Port 8080)

## Quick Start

### 1. Start All Services

```bash
cd docker
docker-compose up -d
```

### 2. Check Status

```bash
docker-compose ps
```

### 3. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f mariadb
docker-compose logs -f redis
```

### 4. Stop Services

```bash
docker-compose stop
```

### 5. Stop and Remove

```bash
docker-compose down
```

### 6. Stop and Remove with Volumes (Delete all data)

```bash
docker-compose down -v
```

## Access Information

### MariaDB
- **Host**: localhost
- **Port**: 3306
- **Database**: nocman_db
- **User**: nocman_user
- **Password**: nocman_pass_2024
- **Root Password**: nocman_root_2024

### Redis
- **Host**: localhost
- **Port**: 6379
- **Password**: nocman_redis_2024

### phpMyAdmin
- **URL**: http://localhost:8080
- **Username**: root
- **Password**: nocman_root_2024

## Database Connection String

For backend application:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=nocman_db
DB_USER=nocman_user
DB_PASSWORD=nocman_pass_2024

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=nocman_redis_2024
```

## Useful Commands

### Connect to MariaDB CLI

```bash
docker exec -it nocman_mariadb mysql -u root -p
# Password: nocman_root_2024
```

### Connect to Redis CLI

```bash
docker exec -it nocman_redis redis-cli
# AUTH nocman_redis_2024
```

### Backup Database

```bash
docker exec nocman_mariadb mysqldump -u root -pnocman_root_2024 nocman_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database

```bash
docker exec -i nocman_mariadb mysql -u root -pnocman_root_2024 nocman_db < backup.sql
```

### Import RADIUS Database (Reference)

```bash
docker exec -i nocman_mariadb mysql -u root -pnocman_root_2024 nocman_db < /path/to/MixRadiusDB_Fastkho.sql
```

## Data Persistence

Data disimpan di Docker volumes:
- `mariadb_data` - Database files
- `redis_data` - Redis persistence

Data akan tetap ada meskipun container di-restart, kecuali jika Anda run `docker-compose down -v`

## Troubleshooting

### Port Already in Use

Jika port 3306, 6379, atau 8080 sudah digunakan, edit `docker-compose.yml`:

```yaml
ports:
  - "3307:3306"  # Ganti 3306 dengan port lain
```

### Container Won't Start

```bash
# View logs
docker-compose logs mariadb

# Remove and recreate
docker-compose down
docker-compose up -d
```

### Reset Everything

```bash
docker-compose down -v
docker-compose up -d
```
