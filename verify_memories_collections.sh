#!/usr/bin/env bash
set -euo pipefail

# Preflight checks
command -v jq >/dev/null || { echo "❌ jq required"; exit 1; }

: "${BASE_URL:?Set BASE_URL like https://YOUR-PROJECT.supabase.co}"
: "${TOKEN:?Set TOKEN to a valid user access token (Bearer)}"
: "${PERSONA_ID:?Set PERSONA_ID to a persona UUID}"

# Validate PERSONA_ID format
[[ $PERSONA_ID =~ ^[0-9a-f-]{36}$ ]] || { echo "❌ invalid PERSONA_ID format"; exit 1; }

MEM_URL="$BASE_URL/functions/v1/persona-list-memories"
COLL_URL="$BASE_URL/functions/v1/persona-list-collections"
HDR_AUTH=(-H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json")
CURL_OPTS=(--max-time 20 --retry 2 --retry-connrefused)

ALL_OK=true
pass(){ echo "✅ $*"; }
fail(){ echo "❌ $*"; ALL_OK=false; exit 1; }

# 1) Baseline
echo "1) Baseline list…"
P1=$(curl -sfS "${CURL_OPTS[@]}" "${HDR_AUTH[@]}" "$MEM_URL?persona_id=$PERSONA_ID&limit=10") || fail "baseline request failed"
P1_COUNT=$(jq '.data|length' <<<"$P1")
CUR1=$(jq -r '.next_cursor // empty' <<<"$P1")
pass "baseline ok (count=$P1_COUNT, cursor=${CUR1:-none})"

# 2) Pagination + de-dupes
echo "2) Pagination; no duplicates…"
if [[ -n "${CUR1:-}" ]]; then
  enc_cur=$(printf %s "$CUR1" | jq -sRr @uri)
  P2=$(curl -sfS "${CURL_OPTS[@]}" "${HDR_AUTH[@]}" "$MEM_URL?persona_id=$PERSONA_ID&limit=10&cursor=$enc_cur") || fail "page2 request failed"
  IDS1=$(jq -r '.data[].id' <<<"$P1")
  IDS2=$(jq -r '.data[].id' <<<"$P2")
  DUPES=$( (printf "%s\n" "$IDS1"; printf "%s\n" "$IDS2") | sort | uniq -d )
  [[ -z "$DUPES" ]] || fail "duplicate ids across pages: $DUPES"
  pass "pagination ok (no dupes)"
else
  pass "single page only — pagination N/A"
fi

# 3) Type filter
echo "3) Type filter=facts…"
PF=$(curl -sfS "${CURL_OPTS[@]}" "${HDR_AUTH[@]}" "$MEM_URL?persona_id=$PERSONA_ID&type=facts&limit=10") || fail "type filter failed"
BAD=$(jq -r '.data[]?|select(.type!="facts")|.id' <<<"$PF")
[[ -z "$BAD" ]] || fail "non-facts returned: $BAD"
pass "type filter ok"

# 4) Tag filter
echo "4) Tag filter=news…"
PT=$(curl -sfS "${CURL_OPTS[@]}" "${HDR_AUTH[@]}" "$MEM_URL?persona_id=$PERSONA_ID&tag=news&limit=10") || fail "tag filter failed"
HAS=$(jq '.data|length' <<<"$PT")
if [[ "$HAS" -gt 0 ]]; then
  MISSING=$(jq -r '.data[]|select(((.tags//[])|index("news"))|not)|.id' <<<"$PT")
  [[ -z "$MISSING" ]] || fail "missing 'news' tag on ids: $MISSING"
fi
pass "tag filter ok (rows=$HAS)"

# 5) RLS unauth check
echo "5) RLS unauth check…"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${CURL_OPTS[@]:0:1}" "$MEM_URL?persona_id=$PERSONA_ID&limit=1")
[[ "$HTTP_CODE" =~ ^401|403$ ]] || fail "unauth expected 401/403, got $HTTP_CODE"
pass "RLS ok ($HTTP_CODE)"

# 6) Collections
echo "6) Collections list…"
CL=$(curl -sfS "${CURL_OPTS[@]}" "${HDR_AUTH[@]}" "$COLL_URL?persona_id=$PERSONA_ID") || fail "collections failed"
jq -e '.data|type=="array"' >/dev/null <<<"$CL" || fail "collections: .data not array"
pass "collections ok ($(jq '.data|length' <<<"$CL") items)"

# 7) Cursor tamper safety
echo "7) Cursor tamper safety…"
TAMP=$(curl -s -o /dev/null -w "%{http_code}" "${CURL_OPTS[@]:0:1}" "${HDR_AUTH[@]}" "$MEM_URL?persona_id=$PERSONA_ID&limit=10&cursor=$(printf bogus\|cursor | jq -sRr @uri)")
[[ "$TAMP" =~ ^2..$ || "$TAMP" == 400 ]] || fail "tampered cursor unexpected HTTP $TAMP"
pass "cursor tamper handled (HTTP $TAMP)"

echo
if [[ "$ALL_OK" == "true" && "$P1_COUNT" -ge 0 ]]; then
  pass "All checks passed successfully."
else
  echo "❌ Some checks failed."
  exit 1
fi