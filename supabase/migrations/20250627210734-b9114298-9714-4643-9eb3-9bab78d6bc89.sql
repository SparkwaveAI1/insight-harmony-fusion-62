
-- Create the character-images storage bucket
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES (
  'character-images', 
  'character-images', 
  true, 
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp'], 
  10485760
);

-- Create RLS policies for the character-images bucket
CREATE POLICY "Anyone can view character images" ON storage.objects
FOR SELECT USING (bucket_id = 'character-images');

CREATE POLICY "Authenticated users can upload character images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'character-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own character images" ON storage.objects
FOR UPDATE USING (bucket_id = 'character-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own character images" ON storage.objects
FOR DELETE USING (bucket_id = 'character-images' AND auth.role() = 'authenticated');
