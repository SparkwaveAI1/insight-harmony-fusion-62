
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Ensures the required storage buckets exist and creates them if they don't
 */
export async function ensureStorageBuckets(): Promise<boolean> {
  try {
    console.log('Checking and ensuring storage buckets exist...');
    
    // List available buckets to see what we have
    const { data: bucketList, error: listError } = await supabase
      .storage
      .listBuckets();
    
    if (listError) {
      console.error('Error listing storage buckets:', listError);
      
      // Create buckets if we couldn't list them (might be permissions)
      return await createStorageBuckets();
    }
    
    console.log('Available buckets:', bucketList || []);
    
    // Check if our required buckets exist in the list
    const bucketNames = bucketList?.map(bucket => bucket.name) || [];
    const hasTranscriptsBucket = bucketNames.includes('transcripts');
    const hasAudioBucket = bucketNames.includes('interview-audio');
    
    console.log('Bucket check results:', { hasTranscriptsBucket, hasAudioBucket });
    
    // If buckets don't exist, try to create them
    if (!hasTranscriptsBucket || !hasAudioBucket) {
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
    let success = true;
    
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
        success = false;
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
        success = false;
      }
    }
    
    return success;
  } catch (error) {
    console.error('Error creating storage buckets:', error);
    toast.error('Failed to create storage buckets. Please check your Supabase permissions.');
    return false;
  }
}
