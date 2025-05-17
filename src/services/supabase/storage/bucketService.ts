
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Ensures the required storage buckets exist and creates them if they don't
 */
export async function ensureStorageBuckets(): Promise<boolean> {
  try {
    console.log('Checking and ensuring storage buckets exist...');
    
    // First check if buckets exist by listing them
    const { data: bucketList, error: listError } = await supabase
      .storage
      .listBuckets();
    
    if (listError) {
      console.error('Error listing storage buckets:', listError);
      return await createStorageBuckets();
    }
    
    // Check if our required buckets exist in the list
    const bucketNames = bucketList?.map(bucket => bucket.name) || [];
    const hasTranscriptsBucket = bucketNames.includes('transcripts');
    const hasAudioBucket = bucketNames.includes('interview-audio');
    const hasPersonaImagesBucket = bucketNames.includes('persona-images');
    
    console.log('Bucket check results:', { hasTranscriptsBucket, hasAudioBucket, hasPersonaImagesBucket });
    
    // If any bucket doesn't exist, create them all
    if (!hasTranscriptsBucket || !hasAudioBucket || !hasPersonaImagesBucket) {
      return await createStorageBuckets();
    }
    
    console.log('All required storage buckets exist ✅');
    return true;
  } catch (error) {
    console.error('Error checking storage buckets:', error);
    return await createStorageBuckets(); // Try creating as a fallback
  }
}

/**
 * Creates the required storage buckets if they don't exist
 */
export async function createStorageBuckets(): Promise<boolean> {
  try {
    console.log('Creating storage buckets...');
    
    // Create persona-images bucket with public access
    try {
      const { data: existingBuckets } = await supabase.storage.listBuckets();
      const bucketExists = existingBuckets?.some(b => b.name === 'persona-images');
      
      if (!bucketExists) {
        const { data, error } = await supabase.storage.createBucket('persona-images', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
        
        if (error) throw error;
        console.log('Created persona-images bucket ✅');
      } else {
        console.log('Persona-images bucket already exists ✅');
      }
    } catch (error: any) {
      // If bucket already exists, that's fine
      if (error.message && error.message.includes('already exists')) {
        console.log('Persona-images bucket already exists ✅');
      } else {
        console.error('Error creating persona-images bucket:', error);
        // We'll continue with other buckets even if this one fails
      }
    }
    
    // Create transcripts bucket if needed
    try {
      await supabase.storage.createBucket('transcripts', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      });
      console.log('Created transcripts bucket ✅');
    } catch (error: any) {
      // If bucket already exists, that's fine
      if (error.message && error.message.includes('already exists')) {
        console.log('Transcripts bucket already exists ✅');
      } else {
        console.error('Error creating transcripts bucket:', error);
      }
    }
    
    // Create interview-audio bucket if needed
    try {
      await supabase.storage.createBucket('interview-audio', {
        public: true,
        fileSizeLimit: 52428800, // 50MB
      });
      console.log('Created interview-audio bucket ✅');
    } catch (error: any) {
      // If bucket already exists, that's fine
      if (error.message && error.message.includes('already exists')) {
        console.log('Interview-audio bucket already exists ✅');
      } else {
        console.error('Error creating interview-audio bucket:', error);
      }
    }
    
    console.log('Buckets created with appropriate permissions ✅');
    
    return true;
  } catch (error) {
    console.error('Error creating storage buckets:', error);
    toast.error('Failed to create storage buckets. Please check your Supabase permissions.');
    return false;
  }
}
