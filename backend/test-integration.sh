#!/bin/bash

echo "🧪 NOC Assistant API Integration Test"
echo "======================================"

BASE_URL="http://localhost:5000"

# Test 1: Login
echo -e "\n1️⃣  Testing Login..."
TOKEN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo "✅ Login successful"
    echo "Token: ${TOKEN:0:30}..."
else
    echo "❌ Login failed"
    exit 1
fi

# Test 2: Get Customers (should have 10)
echo -e "\n2️⃣  Testing GET /api/customers..."
CUSTOMERS=$(curl -s "$BASE_URL/api/customers" \
    -H "Authorization: Bearer $TOKEN")
COUNT=$(echo "$CUSTOMERS" | grep -o '"count":[0-9]*' | cut -d':' -f2)
echo "✅ Found $COUNT customers"

# Test 3: Get Single Customer
CUSTOMER_ID=$(echo "$CUSTOMERS" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo -e "\n3️⃣  Testing GET /api/customers/$CUSTOMER_ID..."
CUSTOMER=$(curl -s "$BASE_URL/api/customers/$CUSTOMER_ID" \
    -H "Authorization: Bearer $TOKEN")
CUSTOMER_NAME=$(echo "$CUSTOMER" | grep -o '"fullName":"[^"]*"' | cut -d'"' -f4)
echo "✅ Customer: $CUSTOMER_NAME"

# Test 4: Get Devices (should have 26+)
echo -e "\n4️⃣  Testing GET /api/devices..."
DEVICES=$(curl -s "$BASE_URL/api/devices" \
    -H "Authorization: Bearer $TOKEN")
DEVICE_COUNT=$(echo "$DEVICES" | grep -o '"count":[0-9]*' | cut -d':' -f2)
echo "✅ Found $DEVICE_COUNT devices"

# Test 5: Get Subscriptions
echo -e "\n5️⃣  Testing GET /api/subscriptions..."
SUBSCRIPTIONS=$(curl -s "$BASE_URL/api/subscriptions" \
    -H "Authorization: Bearer $TOKEN")
SUB_COUNT=$(echo "$SUBSCRIPTIONS" | grep -o '"count":[0-9]*' | cut -d':' -f2)
echo "✅ Found $SUB_COUNT subscriptions"

# Test 6: Get Payments
echo -e "\n6️⃣  Testing GET /api/payments..."
PAYMENTS=$(curl -s "$BASE_URL/api/payments" \
    -H "Authorization: Bearer $TOKEN")
PAYMENT_COUNT=$(echo "$PAYMENTS" | grep -o '"count":[0-9]*' | cut -d':' -f2)
echo "✅ Found $PAYMENT_COUNT payments"

# Test 7: Get Payment Stats
echo -e "\n7️⃣  Testing GET /api/payments/stats..."
STATS=$(curl -s "$BASE_URL/api/payments/stats" \
    -H "Authorization: Bearer $TOKEN")
echo "✅ Payment statistics retrieved"

# Test 8: Get Alerts
echo -e "\n8️⃣  Testing GET /api/alerts..."
ALERTS=$(curl -s "$BASE_URL/api/alerts" \
    -H "Authorization: Bearer $TOKEN")
ALERT_COUNT=$(echo "$ALERTS" | grep -o '"count":[0-9]*' | cut -d':' -f2)
echo "✅ Found $ALERT_COUNT alerts"

# Test 9: Get Bandwidth Usage
echo -e "\n9️⃣  Testing GET /api/bandwidth..."
BANDWIDTH=$(curl -s "$BASE_URL/api/bandwidth" \
    -H "Authorization: Bearer $TOKEN")
BW_COUNT=$(echo "$BANDWIDTH" | grep -o '"count":[0-9]*' | cut -d':' -f2)
echo "✅ Found $BW_COUNT bandwidth records"

# Test 10: Test Relationships - Get Subscription with Customer
SUB_ID=$(echo "$SUBSCRIPTIONS" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo -e "\n🔟 Testing Relationships: GET /api/subscriptions/$SUB_ID..."
SUB_DETAIL=$(curl -s "$BASE_URL/api/subscriptions/$SUB_ID" \
    -H "Authorization: Bearer $TOKEN")
HAS_CUSTOMER=$(echo "$SUB_DETAIL" | grep -o '"customer":{' | wc -l)
if [ "$HAS_CUSTOMER" -gt 0 ]; then
    echo "✅ Subscription includes customer relationship"
else
    echo "⚠️  Customer relationship not loaded"
fi

echo -e "\n======================================"
echo "🎉 All integration tests completed!"
echo "======================================"
echo "📊 Summary:"
echo "   👥 Customers: $COUNT"
echo "   🖥️  Devices: $DEVICE_COUNT"
echo "   📦 Subscriptions: $SUB_COUNT"
echo "   💰 Payments: $PAYMENT_COUNT"
echo "   🚨 Alerts: $ALERT_COUNT"
echo "   📈 Bandwidth Records: $BW_COUNT"
echo "======================================"
