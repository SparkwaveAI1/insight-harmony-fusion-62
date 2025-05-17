
import { supabase } from '@/integrations/supabase/client';

// List of all storage buckets used in the application
const STORAGE_BUCKETS = [
  {
    name: 'persona-images',
    isPublic: true
  },
  {
    name: 'audio-recordings',
    isPublic: false
  },
  {
    name: 'transcripts',
    isPublic: false
  }
];

// Create a single storage bucket
export async function createStorageBucket(
  name: string,
  isPublic: boolean = false
): Promise<boolean> {
  try {
    console.log(`Creating storage bucket: ${name} (public: ${isPublic})`);
    
    // First check if the bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error(`Error checking if bucket ${name} exists:`, listError);
    } else {
      const bucketExists = buckets?.some(bucket => bucket.name === name);
      if (bucketExists) {
        console.log(`Bucket ${name} already exists, no need to create it`);
        return true;
      }
    }
    
    // Create the bucket if it doesn't already exist
    const { error } = await supabase.storage.createBucket(name, {
      public: isPublic
    });
    
    if (error) {
      // If the error is because the bucket already exists, that's okay
      if (error.message.includes('already exists')) {
        console.log(`Bucket ${name} already exists`);
        return true;
      }
      
      console.error(`Error creating bucket ${name}:`, error);
      return false;
    }
    
    console.log(`Successfully created bucket: ${name}`);
    return true;
  } catch (error) {
    console.error(`Error creating bucket ${name}:`, error);
    return false;
  }
}

// Create all storage buckets
export async function createStorageBuckets(): Promise<boolean> {
  try {
    console.log('Creating all required storage buckets...');
    
    const results = await Promise.all(
      STORAGE_BUCKETS.map(bucket => 
        createStorageBucket(bucket.name, bucket.isPublic)
      )
    );
    
    const allSucceeded = results.every(Boolean);
    
    if (allSucceeded) {
      console.log('All storage buckets created successfully');
    } else {
      console.error('Failed to create some storage buckets');
    }
    
    return allSucceeded;
  } catch (error) {
    console.error('Error creating storage buckets:', error);
    return false;
  }
}

// Ensure all required storage buckets exist
export async function ensureStorageBuckets(): Promise<boolean> {
  try {
    console.log('Checking storage buckets...');
    
    // Get list of existing buckets
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing storage buckets:', listError);
      // Try to create all buckets anyway
      return await createStorageBuckets();
    }
    
    console.log('Existing buckets:', existingBuckets?.map(b => b.name) || []);
    
    // Create missing buckets
    const existingBucketNames = existingBuckets?.map(b => b.name) || [];
    const missingBuckets = STORAGE_BUCKETS.filter(
      bucket => !existingBucketNames.includes(bucket.name)
    );
    
    if (missingBuckets.length === 0) {
      console.log('All required storage buckets exist');
      return true;
    }
    
    console.log(`Creating ${missingBuckets.length} missing storage buckets:`, missingBuckets.map(b => b.name));
    
    const results = await Promise.all(
      missingBuckets.map(bucket => 
        createStorageBucket(bucket.name, bucket.isPublic)
      )
    );
    
    const allSucceeded = results.every(Boolean);
    
    if (allSucceeded) {
      console.log('All missing storage buckets created successfully');
    } else {
      console.error('Failed to create some missing storage buckets');
    }
    
    return allSucceeded;
  } catch (error) {
    console.error('Error ensuring storage buckets:', error);
    return false;
  }
}
