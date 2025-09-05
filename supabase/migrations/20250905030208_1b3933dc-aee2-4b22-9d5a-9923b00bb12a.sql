-- Delete all incomplete personas that are stuck in creation pipeline
-- These personas have creation_completed = false and are stuck at detailed_traits stage

DELETE FROM v4_personas 
WHERE persona_id IN (
  'v4_1757019775327_cuwu9wug7',  -- Priya Desai (your persona)
  'v4_1757018529405_y1acv3bxf',  -- Greg Thompson (your persona)  
  'v4_1756277085946_8dtxcg6bj',  -- Aetherion Celestus (other user)
  'v4_1756220640971_smx6jpyiq',  -- Jordan Hayes (other user, in collection)
  'v4_1756220525259_j30gedvql'   -- Jordan Hayes (other user, in collection)
) 
AND creation_completed = false 
AND creation_stage = 'detailed_traits';