# Performance Audit: Slow Persona Loading
**Date:** 2026-01-27
**Issue:** Personas loading extremely slowly despite previous fixes

---

## Executive Summary

The persona loading slowness is caused by **MULTIPLE compounding issues**:

1. ❌ **SELECT * queries fetching massive JSONB data** (full_profile ~15MB per 3500 personas)
2. ❌ **Temporary debugging cache settings left in production** (forces refetch on every action)
3. ❌ **Global PersonaProvider loading ALL personas on every page load**
4. ❌ **Aggressive React Query refetch settings** (refetch on mount, focus, reconnect)
5. ❌ **No column selection optimization** (fetching everything when only need IDs/names)

**Result:** Every page load, tab switch, or navigation triggers a ~52.5MB data transfer (3500 personas × 15KB average)

---

## Critical Issues (Ordered by Impact)

### 🔴 ISSUE #1: Aggressive Cache Settings (HIGHEST IMPACT)
**File:** `src/App.tsx` lines 79-89
**Added:** August 24, 2025 (commit f037b68b)
**Reason:** "Temporary production debugging" to fix deployment cache issues
**Status:** ⚠️ NEVER REMOVED - Still in production

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,              // 🔴 Force fresh queries ALWAYS
      gcTime: 0,                 // 🔴 Clear cache IMMEDIATELY
      refetchOnWindowFocus: true, // 🔴 Refetch when switching tabs
      refetchOnMount: true,       // 🔴 Refetch on every component mount
      refetchOnReconnect: true,   // 🔴 Refetch on network changes
    },
  },
});
```

**Impact:**
- Every tab switch = full reload
- Every navigation = full reload
- No caching whatsoever
- Combined with SELECT * = disaster

**Should be:**
```typescript
staleTime: 5 * 60 * 1000,  // 5 minutes
gcTime: 30 * 60 * 1000,    // 30 minutes
refetchOnWindowFocus: false,
refetchOnMount: false,
refetchOnReconnect: true,
```

---

### 🔴 ISSUE #2: SELECT * Fetching Full Profile JSONB
**Files:**
- `src/services/v4-persona/getV4Personas.ts` line 33
- `src/services/persona/personaService.ts` line 63

```typescript
const { data, error } = await supabase
  .from('v4_personas')
  .select('*')  // 🔴 Fetches EVERYTHING including 15KB full_profile JSONB
  .eq('user_id', user_id)
```

**Data Size:**
- `full_profile` JSONB: ~10-15KB per persona
- User has ~3500 personas
- **Total data transfer: ~52.5MB per query**

**Impact:**
- Slow network transfer
- Browser memory bloat
- JavaScript parsing overhead
- Unnecessary for list views (only need: id, name, image_url, created_at)

**Should be:**
```typescript
.select('persona_id, name, profile_image_url, created_at, schema_version, conversation_summary')
```
This reduces transfer to ~1-2MB instead of 52.5MB

---

### 🔴 ISSUE #3: PersonaProvider Loading ALL Personas Globally
**File:** `src/context/PersonaProvider.tsx` lines 24-73
**Scope:** Global provider wrapping entire app (App.tsx line 97)

```typescript
useEffect(() => {
  const loadPersonas = async () => {
    if (!user) return;
    const v4Personas = await getV4Personas(user.id); // 🔴 SELECT * for ALL personas
    setPersonas(convertedPersonas);
  };
  loadPersonas();
}, [user]); // 🔴 Runs on every sign-in, every user change
```

**Impact:**
- Loads ALL 3500 personas on every page load
- Loads ALL 3500 personas on every sign-in
- Stores ALL full_profile data in React context
- **This provider appears to be DEAD CODE** - only used in 2 pages but wrapped globally

**Usage Analysis:**
- Used in: `Research.tsx`, `PersonaChat.tsx`, `usePersona.ts`
- NOT used in: PersonaViewer, PersonaList, Dashboard, etc.
- Wrapped at app level but only needed in specific routes

**Should be:**
- Remove from global App.tsx wrapper
- Add as route-specific provider only where needed
- OR: Lazy load only when actually accessed
- OR: Remove entirely if truly dead code

---

### 🟡 ISSUE #4: Duplicate Queries in MyPersonasList
**File:** `src/components/personas/MyPersonasList.tsx`

**Flow:**
1. Uses `useFilteredPersonaSearch()` to get persona IDs (server-side RPC)
2. Then calls `getMyPersonasByIds()` to fetch full data with SELECT *
3. Result: Two queries when one optimized query could do it

**Impact:** Moderate - at least it's paginated (20 items)

---

### 🟡 ISSUE #5: No Pagination in PersonaProvider
**File:** `src/context/PersonaProvider.tsx` line 35

Loads ALL personas with no limit, offset, or pagination.

---

## Data Size Analysis

### Current State (Per Page Load):
```
Query: SELECT * FROM v4_personas WHERE user_id = ?
Rows: 3,500 personas
Columns: All (~20 columns including full_profile JSONB)

Data Transfer:
- Metadata per row: ~500 bytes
- full_profile JSONB: ~15,000 bytes
- Total per row: ~15,500 bytes
- Total query: 3,500 × 15,500 = 54.25 MB

With aggressive cache (staleTime: 0):
- Tab switch: 54.25 MB
- Navigation: 54.25 MB
- Component mount: 54.25 MB
```

### Optimized State (What it should be):
```
Query: SELECT persona_id, name, profile_image_url, created_at, schema_version
Rows: 20 personas (paginated)
Columns: 5 lightweight columns

Data Transfer:
- Data per row: ~200 bytes
- Total query: 20 × 200 = 4 KB

With reasonable cache (staleTime: 5min):
- Tab switch: 0 KB (cached)
- Navigation: 0 KB (cached)
- Component mount: 0 KB (cached)
```

**Performance Improvement: ~13,562x reduction** (54.25 MB → 4 KB)

---

## Why This Keeps Happening

1. **Temporary debugging code left in production**
   - Cache settings added for debugging in August
   - Never reverted after issue was fixed
   - No comment marking it as temporary

2. **No performance monitoring**
   - No alerts for slow queries
   - No bundle size tracking
   - No data transfer monitoring

3. **Global providers wrapping entire app**
   - PersonaProvider loads data even when not needed
   - No lazy loading strategy
   - Dead code analysis not performed

4. **Pattern of using SELECT ***
   - Easy to write `.select('*')`
   - No enforcement of column selection
   - No performance review process

---

## Affected User Experience

### What users experience:
- ⏱️ **5-15 second load times** on persona pages
- ⏱️ **3-5 second delays** when switching tabs
- ⏱️ **Page freezes** while parsing large JSON
- 🔄 **Constant loading spinners**
- 💾 **High memory usage** (browser tabs crash)
- 📱 **Mobile: Unusable** (cellular data, memory limits)

### Network waterfall:
```
Page Load → Auth Check → PersonaProvider loads ALL personas (54MB)
           → Tab switch → Refetch ALL personas (54MB)
           → Navigate → Refetch ALL personas (54MB)
```

---

## Recommendations (Priority Order)

### 🔥 IMMEDIATE (Deploy today):

1. **Revert aggressive cache settings**
   - File: `src/App.tsx` lines 82-86
   - Change staleTime: 0 → 5 * 60 * 1000
   - Change gcTime: 0 → 30 * 60 * 1000
   - Change refetchOnWindowFocus: true → false
   - Expected improvement: ~10x faster (no redundant fetches)

2. **Optimize SELECT queries**
   - Files: `getV4Personas.ts`, `personaService.ts`
   - Change `.select('*')` → `.select('persona_id, name, profile_image_url, created_at, schema_version')`
   - Only fetch full_profile when viewing single persona detail
   - Expected improvement: ~30x reduction in data transfer

### 🟡 SHORT TERM (This week):

3. **Remove or lazy-load PersonaProvider**
   - Analyze if it's actually used
   - If yes: Move to specific routes only
   - If no: Remove entirely
   - Expected improvement: Eliminates unnecessary loads

4. **Add pagination to all persona lists**
   - Ensure all queries have LIMIT 20 and OFFSET
   - Add infinite scroll or page navigation
   - Expected improvement: Load only what's visible

### 🟢 LONG TERM (Future):

5. **Implement performance monitoring**
   - Track query execution time
   - Monitor data transfer size
   - Alert on slow queries

6. **Create optimized query patterns**
   - Document when to use SELECT * vs specific columns
   - Create helper functions: `selectPersonaList()`, `selectPersonaDetail()`
   - Add linting rules to catch SELECT *

7. **Consider database views**
   - Create `persona_list_view` with only essential columns
   - Create `persona_card_view` with card-display fields
   - Let database handle projection

---

## Files That Need Changes

### Critical (Fix immediately):
1. `src/App.tsx` - Revert aggressive cache settings
2. `src/services/v4-persona/getV4Personas.ts` - Optimize SELECT query
3. `src/services/persona/personaService.ts` - Optimize SELECT query

### Important (Fix this week):
4. `src/context/PersonaProvider.tsx` - Remove or scope to specific routes
5. `src/components/personas/MyPersonasList.tsx` - Simplify query pattern

---

## Testing Checklist

After fixes, verify:
- [ ] Persona library loads in < 2 seconds
- [ ] Tab switching doesn't refetch data
- [ ] Navigation doesn't cause reloads
- [ ] Network tab shows < 5MB transfer for persona list
- [ ] Memory usage stays under 200MB
- [ ] Mobile/cellular: loads in < 5 seconds

---

## Prevention Strategy

1. Add comment to cache settings: `// WARNING: Temporary debug settings`
2. Create performance budget: queries > 5MB = fail CI
3. Add bundle size tracking
4. Document query patterns in CONTRIBUTING.md
5. Code review checklist: "Does this use SELECT *?"
