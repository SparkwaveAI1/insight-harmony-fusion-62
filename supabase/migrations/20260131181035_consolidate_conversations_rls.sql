-- Migration: Consolidate duplicate RLS policies on conversations table
-- Date: 2026-01-31
-- Issue: 12 duplicate/overlapping policies causing ambiguous permission checks
-- Fix: Drop all existing and create clean, consolidated policies

-- Step 1: Drop ALL existing policies on conversations (handles duplicates)
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'conversations' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON conversations', pol.policyname);
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- Step 2: Ensure RLS is enabled
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Step 3: Create consolidated policies (one per operation)

-- SELECT: Users can view their own conversations
CREATE POLICY "conversations_select_own" 
ON conversations 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- INSERT: Users can create their own conversations
CREATE POLICY "conversations_insert_own" 
ON conversations 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own conversations
CREATE POLICY "conversations_update_own" 
ON conversations 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own conversations
CREATE POLICY "conversations_delete_own" 
ON conversations 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Step 4: Add missing index for performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_session_updated 
ON conversations (user_id, session_type, updated_at DESC);

-- Log completion
DO $$ 
BEGIN
    RAISE NOTICE 'RLS policies consolidated successfully. 4 clean policies created.';
END $$;
