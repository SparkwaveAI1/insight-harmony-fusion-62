
-- Create a storage bucket for character videos
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES (
  'character-videos', 
  'character-videos', 
  true, 
  ARRAY['video/mp4', 'video/webm', 'video/mov', 'video/avi'], 
  104857600  -- 100MB limit
);

-- Create RLS policies for the character-videos bucket
CREATE POLICY "Anyone can view character videos" ON storage.objects
FOR SELECT USING (bucket_id = 'character-videos');

CREATE POLICY "Authenticated users can upload character videos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'character-videos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update character videos" ON storage.objects
FOR UPDATE USING (bucket_id = 'character-videos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete character videos" ON storage.objects
FOR DELETE USING (bucket_id = 'character-videos' AND auth.role() = 'authenticated');

-- Create a table to store featured character video metadata
CREATE TABLE public.featured_character_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  character_type TEXT NOT NULL CHECK (character_type IN ('historical', 'creative')),
  display_order INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for the featured_character_videos table
ALTER TABLE public.featured_character_videos ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view active featured character videos
CREATE POLICY "Anyone can view active featured character videos" 
  ON public.featured_character_videos 
  FOR SELECT 
  USING (is_active = true);

-- Allow authenticated users to manage featured character videos
CREATE POLICY "Authenticated users can manage featured character videos" 
  ON public.featured_character_videos 
  FOR ALL 
  USING (auth.role() = 'authenticated');

-- Create an index for better performance
CREATE INDEX idx_featured_character_videos_active_order 
  ON public.featured_character_videos (is_active, display_order) 
  WHERE is_active = true;
