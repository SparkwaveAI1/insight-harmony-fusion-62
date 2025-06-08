
import { supabase } from '@/integrations/supabase/client';

export async function ensureStorageBuckets() {
  try {
    console.log('Checking and creating storage buckets...');
    
    // List existing buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return false;
    }
    
    const existingBucketNames = buckets?.map(bucket => bucket.name) || [];
    console.log('Existing buckets:', existingBucketNames);
    
    // Create persona-images bucket if it doesn't exist
    if (!existingBucketNames.includes('persona-images')) {
      console.log('Creating persona-images bucket...');
      
      const { error: createError } = await supabase.storage.createBucket('persona-images', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
        fileSizeLimit: 10485760 // 10MB limit
      });
      
      if (createError) {
        console.error('Error creating persona-images bucket:', createError);
        return false;
      }
      
      console.log('Successfully created persona-images bucket');
    } else {
      console.log('persona-images bucket already exists');
    }
    
    // Verify the bucket is public and accessible
    try {
      const { data: testData } = supabase
        .storage
        .from('persona-images')
        .getPublicUrl('test.png');
        
      console.log('Bucket public URL test:', testData.publicUrl);
    } catch (testError) {
      console.error('Error testing bucket public access:', testError);
    }
    
    return true;
  } catch (error) {
    console.error('Error in ensureStorageBuckets:', error);
    return false;
  }
}
