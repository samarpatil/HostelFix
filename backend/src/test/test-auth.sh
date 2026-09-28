#!/bin/bash

# HostelFix Phase 3 Authentication Testing Script
# Tests all authentication and authorization flows
# Usage: bash src/test/test-auth.sh

set -e

API_URL="http://localhost:5000/api"
STUDENT_TOKEN=""
ADMIN_TOKEN=""

echo "=========================================="
echo "HostelFix Phase 3 - Auth Testing"
echo "=========================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function to print test results
test_result() {
  local name=$1
  local response=$2
  
  if echo "$response" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ PASS${NC}: $name"
    echo "  Response: $(echo "$response" | head -c 100)..."
  else
    echo -e "${RED}✗ FAIL${NC}: $name"
    echo "  Response: $response"
  fi
  echo ""
}

echo -e "${YELLOW}1. Student Registration${NC}"
RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "student@test.local",
    "password": "password123",
    "scholarNumber": "TS/2024/001",
    "phone": "9876543210",
    "hostel": "Hostel A",
    "block": "Block 1",
    "roomNumber": "101"
  }')
test_result "Student Registration" "$RESPONSE"

# Extract token from registration response
STUDENT_TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "  Student Token: ${STUDENT_TOKEN:0:20}..."
echo ""

echo -e "${YELLOW}2. Student Login${NC}"
RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.local",
    "password": "password123"
  }')
test_result "Student Login" "$RESPONSE"

STUDENT_TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "  Student Token: ${STUDENT_TOKEN:0:20}..."
echo ""

echo -e "${YELLOW}3. Invalid Login (Wrong Password)${NC}"
RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.local",
    "password": "wrongpassword"
  }')
if echo "$RESPONSE" | grep -q '"success":false'; then
  echo -e "${GREEN}✓ PASS${NC}: Invalid Login properly rejected"
  echo "  Error: $(echo "$RESPONSE" | grep -o '"message":"[^"]*' | head -1)"
else
  echo -e "${RED}✗ FAIL${NC}: Invalid Login should have been rejected"
  echo "  Response: $RESPONSE"
fi
echo ""

echo -e "${YELLOW}4. Protected Student Route (with valid token)${NC}"
RESPONSE=$(curl -s -X GET "$API_URL/students/profile" \
  -H "Authorization: Bearer $STUDENT_TOKEN")
test_result "Protected Student Route" "$RESPONSE"
echo ""

echo -e "${YELLOW}5. Admin Login (manually create admin or use seed)${NC}"
echo "  Note: Admin must be created via seed script or manually"
echo "  For testing, using student token (will fail authorization)"
RESPONSE=$(curl -s -X GET "$API_URL/admin/dashboard" \
  -H "Authorization: Bearer $STUDENT_TOKEN")
if echo "$RESPONSE" | grep -q '"success":false'; then
  echo -e "${GREEN}✓ PASS${NC}: Student cannot access admin route"
  echo "  Error: $(echo "$RESPONSE" | grep -o '"message":"[^"]*' | head -1)"
else
  echo -e "${RED}✗ FAIL${NC}: Student should not access admin route"
  echo "  Response: $RESPONSE"
fi
echo ""

echo -e "${YELLOW}6. Student Attempting to Access Admin Route (fails)${NC}"
RESPONSE=$(curl -s -X GET "$API_URL/admin/workers" \
  -H "Authorization: Bearer $STUDENT_TOKEN")
if echo "$RESPONSE" | grep -q 'permission'; then
  echo -e "${GREEN}✓ PASS${NC}: Student blocked from admin route"
  echo "  Error: $(echo "$RESPONSE" | grep -o '"message":"[^"]*' | head -1)"
else
  echo -e "${RED}✗ FAIL${NC}: Should reject student accessing admin route"
  echo "  Response: $RESPONSE"
fi
echo ""

echo -e "${YELLOW}7. Invalid JWT Token${NC}"
RESPONSE=$(curl -s -X GET "$API_URL/students/profile" \
  -H "Authorization: Bearer invalid_token_12345")
if echo "$RESPONSE" | grep -q 'Invalid token'; then
  echo -e "${GREEN}✓ PASS${NC}: Invalid token properly rejected"
  echo "  Error: $(echo "$RESPONSE" | grep -o '"message":"[^"]*' | head -1)"
else
  echo -e "${RED}✗ FAIL${NC}: Should reject invalid token"
  echo "  Response: $RESPONSE"
fi
echo ""

echo -e "${YELLOW}8. Missing Authorization Header${NC}"
RESPONSE=$(curl -s -X GET "$API_URL/students/profile")
if echo "$RESPONSE" | grep -q 'No token'; then
  echo -e "${GREEN}✓ PASS${NC}: Missing token properly rejected"
  echo "  Error: $(echo "$RESPONSE" | grep -o '"message":"[^"]*' | head -1)"
else
  echo -e "${RED}✗ FAIL${NC}: Should reject missing token"
  echo "  Response: $RESPONSE"
fi
echo ""

echo -e "${YELLOW}9. Logout${NC}"
RESPONSE=$(curl -s -X POST "$API_URL/auth/logout" \
  -H "Authorization: Bearer $STUDENT_TOKEN")
test_result "Logout" "$RESPONSE"
echo ""

echo -e "${YELLOW}10. Get Current User (Me)${NC}"
RESPONSE=$(curl -s -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $STUDENT_TOKEN")
test_result "Get Current User" "$RESPONSE"
echo ""

echo "=========================================="
echo "Testing Complete"
echo "=========================================="
