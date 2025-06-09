
-- Create storage policies for the existing persona-images bucket
-- Policy to allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload persona images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'persona-images' 
    AND auth.role() = 'authenticated'
  );

-- Policy to allow public read access to persona images
CREATE POLICY "Public read access for persona images" ON storage.objects
  FOR SELECT USING (bucket_id = 'persona-images');

-- Policy to allow users to update their own persona images
CREATE POLICY "Users can update their own persona images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'persona-images' 
    AND auth.role() = 'authenticated'
  );

-- Policy to allow users to delete their own persona images
CREATE POLICY "Users can delete their own persona images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'persona-images' 
    AND auth.role() = 'authenticated'
  );
