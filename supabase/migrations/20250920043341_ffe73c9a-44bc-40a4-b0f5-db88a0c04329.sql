-- Make all existing personas private
UPDATE v4_personas 
SET is_public = false 
WHERE is_public = true;