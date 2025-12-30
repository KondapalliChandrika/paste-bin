#!/bin/bash

# Test script for Pastebin-Lite
# This script tests all major functionality

BASE_URL=${1:-"http://localhost:3000"}

echo "🧪 Testing Pastebin-Lite Application"
echo "Base URL: $BASE_URL"
echo ""

# Test 1: Health Check
echo "1️⃣ Testing Health Check..."
HEALTH_RESPONSE=$(curl -s "$BASE_URL/api/healthz")
echo "Response: $HEALTH_RESPONSE"
echo ""

# Test 2: Create Simple Paste
echo "2️⃣ Creating a simple paste..."
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/pastes" \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello, World! This is a test paste."}')
echo "Response: $CREATE_RESPONSE"
PASTE_ID=$(echo $CREATE_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "Paste ID: $PASTE_ID"
echo ""

# Test 3: Fetch the Paste
if [ ! -z "$PASTE_ID" ]; then
  echo "3️⃣ Fetching the paste..."
  FETCH_RESPONSE=$(curl -s "$BASE_URL/api/pastes/$PASTE_ID")
  echo "Response: $FETCH_RESPONSE"
  echo ""
fi

# Test 4: Create Paste with View Limit
echo "4️⃣ Creating paste with max_views=2..."
VIEW_LIMIT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/pastes" \
  -H "Content-Type: application/json" \
  -d '{"content":"This paste has a view limit of 2","max_views":2}')
echo "Response: $VIEW_LIMIT_RESPONSE"
VIEW_LIMIT_ID=$(echo $VIEW_LIMIT_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "Paste ID: $VIEW_LIMIT_ID"
echo ""

# Test 5: Fetch View-Limited Paste
if [ ! -z "$VIEW_LIMIT_ID" ]; then
  echo "5️⃣ Fetching view-limited paste (1st view)..."
  curl -s "$BASE_URL/api/pastes/$VIEW_LIMIT_ID" | jq '.'
  echo ""
  
  echo "6️⃣ Fetching view-limited paste (2nd view - should be last)..."
  curl -s "$BASE_URL/api/pastes/$VIEW_LIMIT_ID" | jq '.'
  echo ""
  
  echo "7️⃣ Fetching view-limited paste (3rd view - should return 404)..."
  curl -s -w "\nHTTP Status: %{http_code}\n" "$BASE_URL/api/pastes/$VIEW_LIMIT_ID" | jq '.'
  echo ""
fi

# Test 6: Create Paste with TTL (requires TEST_MODE)
echo "8️⃣ Creating paste with TTL (60 seconds)..."
TTL_RESPONSE=$(curl -s -X POST "$BASE_URL/api/pastes" \
  -H "Content-Type: application/json" \
  -d '{"content":"This paste expires in 60 seconds","ttl_seconds":60}')
echo "Response: $TTL_RESPONSE"
TTL_ID=$(echo $TTL_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo ""

# Test 7: Test TTL with x-test-now-ms header (only works if TEST_MODE=1)
if [ ! -z "$TTL_ID" ]; then
  CURRENT_TIME=$(($(date +%s) * 1000))
  FUTURE_TIME=$(($CURRENT_TIME + 61000))
  
  echo "9️⃣ Fetching TTL paste before expiry (TEST_MODE)..."
  curl -s -H "x-test-now-ms: $CURRENT_TIME" "$BASE_URL/api/pastes/$TTL_ID" | jq '.'
  echo ""
  
  echo "🔟 Fetching TTL paste after expiry (TEST_MODE - should return 404)..."
  curl -s -w "\nHTTP Status: %{http_code}\n" -H "x-test-now-ms: $FUTURE_TIME" "$BASE_URL/api/pastes/$TTL_ID" | jq '.'
  echo ""
fi

# Test 8: Invalid Input
echo "1️⃣1️⃣ Testing invalid input (empty content)..."
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST "$BASE_URL/api/pastes" \
  -H "Content-Type: application/json" \
  -d '{"content":""}' | jq '.'
echo ""

echo "✅ Testing complete!"
