#!/usr/bin/env bash
set -euo pipefail

# ── CONFIG ─────────────────────────────────────────────────────────────────────
: "${BASE_URL:?Set BASE_URL like https://YOUR-PROJECT.supabase.co}"
: "${TOKEN:?Set TOKEN to a valid user access token (Bearer) }"
: "${PERSONA_ID:?Set PERSONA_ID to a persona UUID}"

MEM_URL="$BASE_URL/functions/v1/persona-list-memories"
COLL_URL="$BASE_URL/functions/v1/persona-list-collections"
HDR_AUTH=(-H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json")

pass(){ echo -e "✅ $*"; }
fail(){ echo -e "❌ $*"; exit 1; }

curl_jq(){ curl -sfS "$@" | jq -c .; }

# ── 1) BASELINE READ ───────────────────────────────────────────────────────────
echo "1) Baseline list (first page)…"
P1=$(curl -sfS "${HDR_AUTH[@]}" "$MEM_URL?persona_id=$PERSONA_ID&limit=10") \
  || fail "memories baseline request failed"
P1_COUNT=$(jq '.data|length' <<<"$P1")
[[ "$P1_COUNT" -ge 0 ]] || fail "unexpected baseline length"
CUR1=$(jq -r '.next_cursor // empty' <<<"$P1")
pass "baseline ok (count=$P1_COUNT, cursor=${CUR1:-none})"

# ── 2) PAGINATION + DE-DUPES ───────────────────────────────────────────────────
echo "2) Pagination with cursor; no duplicates…"
if [[ -n "${CUR1:-}" ]]; then
  P2=$(curl -sfS "${HDR_AUTH[@]}" "$MEM_URL?persona_id=$PERSONA_ID&limit=10&cursor=$(printf %s "$CUR1" | jq -sRr @uri)") \
    || fail "second page request failed"
  P2_COUNT=$(jq '.data|length' <<<"$P2")
  # collect IDs
  IDS1=$(jq -r '.data[].id' <<<"$P1")
  IDS2=$(jq -r '.data[].id' <<<"$P2")
  # check dupes
  DUPES=$( (printf "%s\n" "$IDS1"; printf "%s\n" "$IDS2") | sort | uniq -d )
  [[ -z "$DUPES" ]] || fail "duplicate ids across pages: $DUPES"
  pass "pagination ok (page2=$P2_COUNT, no dupes)"
else
  pass "single page only (no cursor) — pagination N/A"
fi

# ── 3) TYPE FILTER ─────────────────────────────────────────────────────────────
echo "3) Type filter = facts…"
PF=$(curl -sfS "${HDR_AUTH[@]}" "$MEM_URL?persona_id=$PERSONA_ID&type=fact&limit=10") \
  || fail "type filter request failed"
BAD=$(jq -r '.data[]?|select(.type!="fact")|.id' <<<"$PF")
[[ -z "$BAD" ]] || fail "type filter returned non-fact ids: $BAD"
pass "type filter ok"

# ── 4) TAG FILTER (best-effort: tag=news) ──────────────────────────────────────
echo "4) Tag filter = news…"
PT=$(curl -sfS "${HDR_AUTH[@]}" "$MEM_URL?persona_id=$PERSONA_ID&tag=news&limit=10") \
  || fail "tag filter request failed"
# If there are rows, ensure each includes the tag
HAS=$(jq '.data|length' <<<"$PT")
if [[ "$HAS" -gt 0 ]]; then
  MISSING=$(jq -r '.data[]|select((.tags//[])|index("news")|not)|.id' <<<"$PT")
  [[ -z "$MISSING" ]] || fail "tag filter missing 'news' on ids: $MISSING"
fi
pass "tag filter ok (rows=$HAS)"

# ── 5) RLS: UNAUTH SHOULD FAIL ────────────────────────────────────────────────
echo "5) RLS unauth check…"
set +e
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$MEM_URL?persona_id=$PERSONA_ID&limit=1")
set -e
[[ "$HTTP_CODE" =~ ^401|403$ ]] || fail "unauth expected 401/403, got $HTTP_CODE"
pass "RLS ok (unauth rejected with $HTTP_CODE)"

# ── 6) COLLECTIONS LIST ────────────────────────────────────────────────────────
echo "6) Collections list…"
CL=$(curl -sfS "${HDR_AUTH[@]}" "$COLL_URL?persona_id=$PERSONA_ID") \
  || fail "collections request failed"
# Basic shape check
jq -e '.data|type=="array"' >/dev/null <<<"$CL" || fail "collections: .data not array"
pass "collections ok ($(jq '.data|length' <<<"$CL") items)"

# ── 7) CURSOR TAMPER SAFETY (robust parsing; must not crash/duplicate) ────────
echo "7) Cursor tamper safety…"
TAMP=$(curl -s -o /dev/null -w "%{http_code}" "${HDR_AUTH[@]}" "$MEM_URL?persona_id=$PERSONA_ID&limit=10&cursor=bogus|cursor")
[[ "$TAMP" =~ ^2..$|^400$ ]] || fail "tampered cursor returned unexpected HTTP $TAMP"
pass "cursor tamper handled (HTTP $TAMP)"

echo
pass "All checks passed."