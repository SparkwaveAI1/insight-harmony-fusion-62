-- Clean up queue items marked completed but missing persona_id
-- These indicate failed processing that wasn't properly caught
UPDATE persona_creation_queue 
SET status = 'failed', 
    error_message = 'Processing completed but no persona_id was set - likely creation failed'
WHERE persona_id IS NULL AND status = 'completed';

-- Clean up recent duplicates, keeping the earliest ones
-- Alex Johnson duplicates (keep the first one)
WITH alex_ranked AS (
  SELECT persona_id, name, created_at,
         ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at ASC) as rn
  FROM v4_personas 
  WHERE name = 'Alex Johnson' 
    AND created_at >= NOW() - INTERVAL '1 hour'
)
DELETE FROM v4_personas 
WHERE persona_id IN (
  SELECT persona_id FROM alex_ranked WHERE rn > 1
);

-- Jordan Smith duplicates (keep the first one)
WITH jordan_ranked AS (
  SELECT persona_id, name, created_at,
         ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at ASC) as rn
  FROM v4_personas 
  WHERE name = 'Jordan Smith' 
    AND created_at >= NOW() - INTERVAL '1 hour'
)
DELETE FROM v4_personas 
WHERE persona_id IN (
  SELECT jordan_ranked.persona_id FROM jordan_ranked WHERE rn > 1
);