-- Remove the orphaned persona reference
DELETE FROM collection_personas 
WHERE collection_id = 'b83ece47-72cb-4ece-8416-afda05625653' 
AND persona_id = '024b2b42-7f39-453c-8789-38e98f42c0a2';

-- Add David Kim with correct V4 persona_id to the Real Estate Investors collection
INSERT INTO collection_personas (collection_id, persona_id)
VALUES ('b83ece47-72cb-4ece-8416-afda05625653', 'v4_1755997146752_t9i0orv9k')
ON CONFLICT (collection_id, persona_id) DO NOTHING;