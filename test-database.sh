#!/bin/bash

echo "========================================"
echo "NOC Management - Database Test Script"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker installed${NC}"

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ docker-compose not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ docker-compose installed${NC}"
echo ""

# Go to docker directory
cd docker

echo "Starting Docker services..."
docker-compose up -d

echo ""
echo "Waiting for services to be ready..."
sleep 5

echo ""
echo "Checking services status..."
docker-compose ps

echo ""
echo "========================================"
echo "Testing MariaDB Connection"
echo "========================================"

docker exec nocman_mariadb mysql -u nocman_user -pnocman_pass_2024 -e "SELECT 'MariaDB Connection: OK' as Status;" nocman_db

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ MariaDB connection successful${NC}"
else
    echo -e "${RED}❌ MariaDB connection failed${NC}"
fi

echo ""
echo "========================================"
echo "Testing Redis Connection"
echo "========================================"

docker exec nocman_redis redis-cli -a nocman_redis_2024 PING

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Redis connection successful${NC}"
else
    echo -e "${RED}❌ Redis connection failed${NC}"
fi

echo ""
echo "========================================"
echo "Access Information"
echo "========================================"
echo ""
echo "MariaDB:"
echo "  Host: localhost"
echo "  Port: 3306"
echo "  Database: nocman_db"
echo "  User: nocman_user"
echo "  Password: nocman_pass_2024"
echo ""
echo "Redis:"
echo "  Host: localhost"
echo "  Port: 6379"
echo "  Password: nocman_redis_2024"
echo ""
echo "phpMyAdmin:"
echo "  URL: http://localhost:8080"
echo "  Username: root"
echo "  Password: nocman_root_2024"
echo ""
echo "========================================"
