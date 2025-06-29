
-- Add missing columns for non-humanoid characters to the characters table
ALTER TABLE public.characters 
ADD COLUMN IF NOT EXISTS origin_universe TEXT,
ADD COLUMN IF NOT EXISTS species_type TEXT,
ADD COLUMN IF NOT EXISTS form_factor TEXT;

-- Update existing characters with default values for new columns
UPDATE public.characters 
SET 
  origin_universe = CASE 
    WHEN character_type = 'multi_species' THEN 'Unknown Universe'
    ELSE NULL 
  END,
  species_type = CASE 
    WHEN character_type = 'multi_species' THEN 'Unknown Species'
    ELSE NULL 
  END,
  form_factor = CASE 
    WHEN character_type = 'multi_species' THEN 'Abstract'
    ELSE NULL 
  END
WHERE origin_universe IS NULL OR species_type IS NULL OR form_factor IS NULL;
