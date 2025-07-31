-- Add is_public column to collections table
ALTER TABLE public.collections 
ADD COLUMN is_public boolean NOT NULL DEFAULT false;

-- Update RLS policies to allow viewing public collections
DROP POLICY IF EXISTS "Users can view their own collections" ON public.collections;

-- Create new policies for public/private collections
CREATE POLICY "Users can view their own collections or public ones" 
ON public.collections 
FOR SELECT 
USING (auth.uid() = user_id OR is_public = true);

-- Keep other policies unchanged for create, update, delete (only owners can modify)
CREATE POLICY "Users can view their own collections" 
ON public.collections 
FOR SELECT 
USING (auth.uid() = user_id);