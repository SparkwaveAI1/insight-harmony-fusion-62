-- Trigger backfill: update full_profile to invoke the trigger
UPDATE v4_personas 
SET full_profile = full_profile 
WHERE creation_completed = true;