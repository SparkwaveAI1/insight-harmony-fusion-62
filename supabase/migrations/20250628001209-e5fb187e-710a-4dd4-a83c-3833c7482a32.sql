
-- Add demographic and physical appearance columns to the characters table
ALTER TABLE public.characters 
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS physical_appearance JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS historical_period TEXT,
ADD COLUMN IF NOT EXISTS social_class TEXT,
ADD COLUMN IF NOT EXISTS region TEXT;

-- Update existing characters to have default values
UPDATE public.characters 
SET 
  age = 30,
  gender = 'male',
  physical_appearance = '{
    "height": "average height",
    "build_body_type": "average build", 
    "hair_color": "brown",
    "hair_style": "practical unstyled",
    "eye_color": "brown",
    "skin_tone": "natural complexion"
  }'::jsonb,
  historical_period = '1700s',
  social_class = 'middle class',
  region = 'Europe'
WHERE age IS NULL OR gender IS NULL;
