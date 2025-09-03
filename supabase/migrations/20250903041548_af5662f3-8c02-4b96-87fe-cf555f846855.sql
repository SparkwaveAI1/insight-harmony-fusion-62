-- Delete duplicate David Kim personas created today, keeping the original from August 24th
-- The original is referenced in collections, duplicates are not

DELETE FROM v4_personas 
WHERE name = 'David Kim' 
  AND DATE(created_at) = CURRENT_DATE  -- Only delete today's duplicates
  AND persona_id NOT IN (
    -- Keep personas that are referenced in collections (the original)
    SELECT DISTINCT persona_id 
    FROM collection_personas 
    WHERE persona_id LIKE '%david%' OR persona_id LIKE '%kim%'
  );