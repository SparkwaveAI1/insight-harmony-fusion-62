#!/bin/bash
# Test ACP Search V3
# Usage: ./test-acp-search-v3.sh [query] [count] [precheck]
#
# Examples:
#   ./test-acp-search-v3.sh                           # Test crypto investors
#   ./test-acp-search-v3.sh "women over 40" 5         # Custom query
#   ./test-acp-search-v3.sh "crypto investors" 5 true # Precheck only

set -e

SUPABASE_URL="https://wgerdrdsuusnrdnwwelt.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZXJkcmRzdXVzbnJkbnd3ZWx0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjE4OTEyMCwiZXhwIjoyMDU3NzY1MTIwfQ.sgFdv1QSlPGesPZGJ_sYOagLxn7jDNjELmArJOQlkSU"

QUERY="${1:-crypto investors}"
COUNT="${2:-5}"
PRECHECK="${3:-false}"

echo "=========================================="
echo "ACP Search V3 Test"
echo "=========================================="
echo "Query: $QUERY"
echo "Count: $COUNT"
echo "Precheck: $PRECHECK"
echo ""

# Determine which version to test (v2 or v3)
VERSION="${VERSION:-v3}"
FUNCTION_URL="$SUPABASE_URL/functions/v1/smart-acp-search-$VERSION"

echo "Endpoint: $FUNCTION_URL"
echo ""

START_TIME=$(date +%s%3N)

RESPONSE=$(curl -s --max-time 120 "$FUNCTION_URL" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"research_query\": \"$QUERY\",
    \"persona_count\": $COUNT,
    \"precheck_only\": $PRECHECK
  }")

END_TIME=$(date +%s%3N)
DURATION=$((END_TIME - START_TIME))

echo "Response (${DURATION}ms):"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

echo ""
echo "=========================================="

# Extract key metrics
if echo "$RESPONSE" | jq -e '.status == "success"' > /dev/null 2>&1; then
  echo "✅ SUCCESS"
  if [ "$PRECHECK" = "true" ]; then
    MATCHES=$(echo "$RESPONSE" | jq -r '.match_count // 0')
    CAN_FULFILL=$(echo "$RESPONSE" | jq -r '.can_fulfill')
    echo "  Matches: $MATCHES"
    echo "  Can fulfill: $CAN_FULFILL"
  else
    PERSONAS=$(echo "$RESPONSE" | jq -r '.personas | length')
    TOTAL=$(echo "$RESPONSE" | jq -r '.total_matching // 0')
    echo "  Personas returned: $PERSONAS"
    echo "  Total matching: $TOTAL"
  fi
  INTERNAL_DURATION=$(echo "$RESPONSE" | jq -r '.duration_ms // "N/A"')
  echo "  Internal duration: ${INTERNAL_DURATION}ms"
elif echo "$RESPONSE" | jq -e '.can_fulfill != null' > /dev/null 2>&1; then
  # Precheck response format
  CAN_FULFILL=$(echo "$RESPONSE" | jq -r '.can_fulfill')
  MATCHES=$(echo "$RESPONSE" | jq -r '.match_count // 0')
  if [ "$CAN_FULFILL" = "true" ]; then
    echo "✅ PRECHECK PASS - $MATCHES matches found"
  else
    echo "❌ PRECHECK FAIL - only $MATCHES matches (need $COUNT)"
  fi
else
  echo "❌ FAILED"
  ERROR=$(echo "$RESPONSE" | jq -r '.error // .message // "Unknown error"')
  echo "  Error: $ERROR"
fi

echo "=========================================="
