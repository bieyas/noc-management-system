#!/bin/bash

echo "🧪 Testing NOC Assistant API"
echo "=============================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5000"

# Test 1: Health check
echo -e "\n1️⃣  Testing Health Endpoint..."
HEALTH=$(curl -s "$BASE_URL/health")
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Health endpoint OK${NC}"
    echo "$HEALTH"
else
    echo -e "${RED}❌ Health endpoint FAILED${NC}"
fi

# Test 2: Login
echo -e "\n2️⃣  Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}')

if echo "$LOGIN_RESPONSE" | grep -q '"token"'; then
    echo -e "${GREEN}✅ Login successful${NC}"
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "Token: ${TOKEN:0:50}..."
else
    echo -e "${RED}❌ Login FAILED${NC}"
    echo "$LOGIN_RESPONSE"
    exit 1
fi

# Test 3: Get current user
echo -e "\n3️⃣  Testing Protected Endpoint (Get User Profile)..."
USER_RESPONSE=$(curl -s "$BASE_URL/api/auth/me" \
    -H "Authorization: Bearer $TOKEN")

if echo "$USER_RESPONSE" | grep -q '"username"'; then
    echo -e "${GREEN}✅ User profile retrieved${NC}"
    echo "$USER_RESPONSE"
else
    echo -e "${RED}❌ User profile FAILED${NC}"
    echo "$USER_RESPONSE"
fi

# Test 4: Get all customers (should be empty initially)
echo -e "\n4️⃣  Testing Customer Endpoint..."
CUSTOMERS=$(curl -s "$BASE_URL/api/customers" \
    -H "Authorization: Bearer $TOKEN")

if echo "$CUSTOMERS" | grep -q '"success"'; then
    echo -e "${GREEN}✅ Customer endpoint OK${NC}"
    echo "$CUSTOMERS"
else
    echo -e "${RED}❌ Customer endpoint FAILED${NC}"
    echo "$CUSTOMERS"
fi

# Test 5: Get all devices
echo -e "\n5️⃣  Testing Device Endpoint..."
DEVICES=$(curl -s "$BASE_URL/api/devices" \
    -H "Authorization: Bearer $TOKEN")

if echo "$DEVICES" | grep -q '"success"'; then
    echo -e "${GREEN}✅ Device endpoint OK${NC}"
    echo "$DEVICES"
else
    echo -e "${RED}❌ Device endpoint FAILED${NC}"
    echo "$DEVICES"
fi

# Test 6: Get all subscriptions
echo -e "\n6️⃣  Testing Subscription Endpoint..."
SUBSCRIPTIONS=$(curl -s "$BASE_URL/api/subscriptions" \
    -H "Authorization: Bearer $TOKEN")

if echo "$SUBSCRIPTIONS" | grep -q '"success"'; then
    echo -e "${GREEN}✅ Subscription endpoint OK${NC}"
    echo "$SUBSCRIPTIONS"
else
    echo -e "${RED}❌ Subscription endpoint FAILED${NC}"
    echo "$SUBSCRIPTIONS"
fi

# Test 7: Get all payments
echo -e "\n7️⃣  Testing Payment Endpoint..."
PAYMENTS=$(curl -s "$BASE_URL/api/payments" \
    -H "Authorization: Bearer $TOKEN")

if echo "$PAYMENTS" | grep -q '"success"'; then
    echo -e "${GREEN}✅ Payment endpoint OK${NC}"
    echo "$PAYMENTS"
else
    echo -e "${RED}❌ Payment endpoint FAILED${NC}"
    echo "$PAYMENTS"
fi

# Test 8: Get all alerts
echo -e "\n8️⃣  Testing Alert Endpoint..."
ALERTS=$(curl -s "$BASE_URL/api/alerts" \
    -H "Authorization: Bearer $TOKEN")

if echo "$ALERTS" | grep -q '"success"'; then
    echo -e "${GREEN}✅ Alert endpoint OK${NC}"
    echo "$ALERTS"
else
    echo -e "${RED}❌ Alert endpoint FAILED${NC}"
    echo "$ALERTS"
fi

echo -e "\n=============================="
echo -e "${GREEN}🎉 All tests completed!${NC}"
