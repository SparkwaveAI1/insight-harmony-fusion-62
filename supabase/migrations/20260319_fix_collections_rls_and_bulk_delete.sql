-- ============================================================
-- Fix 1: Ensure collections table has proper RLS policies
-- (collections was created without explicit RLS in migrations)
-- ============================================================

-- Enable RLS on collections (safe to run even if already enabled)
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies first (idempotent)
DROP POLICY IF EXISTS "Users can view their own collections" ON public.collections;
DROP POLICY IF EXISTS "Users can view public collections" ON public.collections;
DROP POLICY IF EXISTS "Users can insert their own collections" ON public.collections;
DROP POLICY IF EXISTS "Users can update their own collections" ON public.collections;
DROP POLICY IF EXISTS "Users can delete their own collections" ON public.collections;

-- SELECT: own collections + all public collections
CREATE POLICY "Users can view their own collections"
  ON public.collections FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

-- INSERT: authenticated users can only insert with their own user_id
CREATE POLICY "Users can insert their own collections"
  ON public.collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: only the owner can update
CREATE POLICY "Users can update their own collections"
  ON public.collections FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: only the owner can delete
CREATE POLICY "Users can delete their own collections"
  ON public.collections FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- Fix 2: Ensure collection_personas RLS covers all operations
-- (existing policy only covers SELECT)
-- ============================================================

-- INSERT: only persona owner can add their personas to collections
DROP POLICY IF EXISTS "Users can insert their own collection_personas" ON public.collection_personas;
CREATE POLICY "Users can insert their own collection_personas"
  ON public.collection_personas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.v4_personas p
      WHERE p.persona_id = collection_personas.persona_id
        AND p.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_personas.collection_id
        AND c.user_id = auth.uid()
    )
  );

-- DELETE: collection owner OR persona owner can remove
DROP POLICY IF EXISTS "Users can delete their own collection_personas" ON public.collection_personas;
CREATE POLICY "Users can delete their own collection_personas"
  ON public.collection_personas FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_personas.collection_id
        AND c.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.v4_personas p
      WHERE p.persona_id = collection_personas.persona_id
        AND p.user_id = auth.uid()
    )
  );
