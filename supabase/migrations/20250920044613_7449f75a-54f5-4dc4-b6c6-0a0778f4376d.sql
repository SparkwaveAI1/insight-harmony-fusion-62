-- Set default for new personas to be public
ALTER TABLE v4_personas 
ALTER COLUMN is_public SET DEFAULT true;