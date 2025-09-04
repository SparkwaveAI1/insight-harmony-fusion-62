# Queue Operations Runbook

## Quick Diagnostics (2 commands for "queue weirdness")

### 1. Check Latest Persona Creation
```sql
-- Verify the most recent personas are properly completed
SELECT 
  persona_id, 
  name,
  creation_stage, 
  creation_completed, 
  profile_image_url IS NOT NULL as has_image,
  created_at,
  updated_at
FROM v4_personas 
WHERE created_at >= NOW() - INTERVAL '2 hours'
ORDER BY created_at DESC 
LIMIT 10;
```

### 2. Check Queue Status
```sql
-- Check recent queue items for proper V4 IDs and status progression
SELECT 
  id, 
  name, 
  status, 
  persona_id,
  persona_id LIKE 'v4_%' as valid_v4_id,
  error_message,
  created_at,
  updated_at
FROM persona_creation_queue 
WHERE created_at >= NOW() - INTERVAL '2 hours'
ORDER BY created_at DESC 
LIMIT 10;
```

## Health Checks

### Find Bad Persona IDs (should be empty after fix)
```sql
-- Bad persona_id shape in queue (should never happen now)
SELECT id, name, status, persona_id, error_message
FROM persona_creation_queue
WHERE persona_id IS NOT NULL AND persona_id NOT LIKE 'v4_%'
ORDER BY updated_at DESC;
```

### Find Stale Processing Rows (should be auto-failed by trigger)
```sql
-- Stale processing rows (>20m) — verify none exist
SELECT id, name, status, updated_at
FROM persona_creation_queue
WHERE status LIKE 'processing%' 
  AND updated_at < NOW() - INTERVAL '20 minutes'
ORDER BY updated_at DESC;
```

### Find Incomplete Personas
```sql
-- Personas that should be complete but aren't
SELECT 
  persona_id, 
  name, 
  creation_stage, 
  creation_completed,
  profile_image_url IS NOT NULL as has_image
FROM v4_personas 
WHERE created_at >= NOW() - INTERVAL '1 hour'
  AND (creation_completed != true OR profile_image_url IS NULL)
ORDER BY created_at DESC;
```

## Troubleshooting Guide

### Issue: UI shows incomplete persona but DB shows complete
**Check:** Verify UI renders from fresh DB fetch, not create response
**Look for:** `TRACE_Q_BEFORE_COMPLETE.render_source === 'db_fetch'`

### Issue: Queue stuck at processing_stage2
**Check:** Persona ID format in queue row
**Expected:** `v4_` prefix, not UUID format
**Action:** Re-run queue item (resume logic will handle correctly)

### Issue: Duplicate personas created
**Check:** Multiple v4_personas rows with same name/timestamp
**Root cause:** Resume logic not working (should be fixed)
**Action:** Check for Stage 1 skip logic in traces

### Issue: Collections not appearing
**Check:** Persona completion status and image presence
**Expected:** Collections added only after `creation_completed=true` AND `profile_image_url` exists

## Trace Analysis

For detailed debugging, look for these traces in console:
- `TRACE_Q_AFTER_CALL1`: Should show `persona_id` starting with `v4_`
- `TRACE_Q_AFTER_CALL2`: Should show stage progression
- `TRACE_Q_AFTER_CALL3`: Should show `profile_image_url` and `creation_completed: true`
- `TRACE_Q_BEFORE_COMPLETE`: Should show `render_source: 'db_fetch'`

## Emergency Cleanup

### Reset Stuck Queue Item
```sql
-- Reset a stuck queue item to retry (use with caution)
UPDATE persona_creation_queue 
SET status = 'pending', 
    locked_at = NULL, 
    processing_started_at = NULL,
    attempt_count = 0,
    error_message = NULL
WHERE id = '<queue-item-id>';
```

### Manual Completion (last resort)
```sql
-- Mark queue item as completed manually
UPDATE persona_creation_queue 
SET status = 'completed', 
    completed_at = NOW()
WHERE id = '<queue-item-id>' 
  AND persona_id LIKE 'v4_%';
```