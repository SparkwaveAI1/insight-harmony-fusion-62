
-- Add the creation_source column to the characters table
ALTER TABLE public.characters 
ADD COLUMN creation_source text DEFAULT 'historical';

-- Update existing characters to have the historical creation source
UPDATE public.characters 
SET creation_source = 'historical' 
WHERE creation_source IS NULL;

-- Make the column NOT NULL now that all rows have values
ALTER TABLE public.characters 
ALTER COLUMN creation_source SET NOT NULL;
