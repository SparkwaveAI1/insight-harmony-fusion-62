
-- Check and create missing RLS policies for projects table (skip the ones that already exist)
DO $$ 
BEGIN
    -- Enable RLS on projects table (safe to run multiple times)
    ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
    
    -- Create policies only if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Users can create their own projects') THEN
        CREATE POLICY "Users can create their own projects" 
          ON public.projects 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Users can update their own projects') THEN
        CREATE POLICY "Users can update their own projects" 
          ON public.projects 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Users can delete their own projects') THEN
        CREATE POLICY "Users can delete their own projects" 
          ON public.projects 
          FOR DELETE 
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- Enable RLS and create policies for conversations table
DO $$
BEGIN
    ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Users can view their own conversations') THEN
        CREATE POLICY "Users can view their own conversations" 
          ON public.conversations 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Users can create their own conversations') THEN
        CREATE POLICY "Users can create their own conversations" 
          ON public.conversations 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Users can update their own conversations') THEN
        CREATE POLICY "Users can update their own conversations" 
          ON public.conversations 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Users can delete their own conversations') THEN
        CREATE POLICY "Users can delete their own conversations" 
          ON public.conversations 
          FOR DELETE 
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- Enable RLS and create policies for conversation_messages table
DO $$
BEGIN
    ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversation_messages' AND policyname = 'Users can view messages from their conversations') THEN
        CREATE POLICY "Users can view messages from their conversations" 
          ON public.conversation_messages 
          FOR SELECT 
          USING (
            EXISTS (
              SELECT 1 FROM public.conversations 
              WHERE conversations.id = conversation_messages.conversation_id 
              AND conversations.user_id = auth.uid()
            )
          );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversation_messages' AND policyname = 'Users can create messages in their conversations') THEN
        CREATE POLICY "Users can create messages in their conversations" 
          ON public.conversation_messages 
          FOR INSERT 
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM public.conversations 
              WHERE conversations.id = conversation_messages.conversation_id 
              AND conversations.user_id = auth.uid()
            )
          );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversation_messages' AND policyname = 'Users can update messages in their conversations') THEN
        CREATE POLICY "Users can update messages in their conversations" 
          ON public.conversation_messages 
          FOR UPDATE 
          USING (
            EXISTS (
              SELECT 1 FROM public.conversations 
              WHERE conversations.id = conversation_messages.conversation_id 
              AND conversations.user_id = auth.uid()
            )
          );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversation_messages' AND policyname = 'Users can delete messages from their conversations') THEN
        CREATE POLICY "Users can delete messages from their conversations" 
          ON public.conversation_messages 
          FOR DELETE 
          USING (
            EXISTS (
              SELECT 1 FROM public.conversations 
              WHERE conversations.id = conversation_messages.conversation_id 
              AND conversations.user_id = auth.uid()
            )
          );
    END IF;
END $$;

-- Enable RLS and create policies for collections table
DO $$
BEGIN
    ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'collections' AND policyname = 'Users can view their own collections') THEN
        CREATE POLICY "Users can view their own collections" 
          ON public.collections 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'collections' AND policyname = 'Users can create their own collections') THEN
        CREATE POLICY "Users can create their own collections" 
          ON public.collections 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'collections' AND policyname = 'Users can update their own collections') THEN
        CREATE POLICY "Users can update their own collections" 
          ON public.collections 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'collections' AND policyname = 'Users can delete their own collections') THEN
        CREATE POLICY "Users can delete their own collections" 
          ON public.collections 
          FOR DELETE 
          USING (auth.uid() = user_id);
    END IF;
END $$;
