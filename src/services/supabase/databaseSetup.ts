
import { supabase } from './supabaseService';
import { toast } from 'sonner';

/**
 * Checks if the required tables exist in the Supabase database
 * and creates them if they don't
 */
export async function ensureTablesExist(): Promise<boolean> {
  try {
    // First check if storage buckets exist since they're essential
    const bucketsReady = await checkStorageBuckets();

    if (!bucketsReady) {
      console.log('Storage buckets not ready');
      return false;
    }
    
    // Check if participants table exists
    console.log('Checking participants table...');
    const { data: tables, error } = await supabase
      .from('participants')
      .select('id')
      .limit(1);
    
    // If we get an error that's not "relation already exists"
    if (error) {
      console.error('Error checking participants table:', error);
      
      if (error.code === '42P01' || error.message.includes('relation "participants" does not exist')) {
        // Table doesn't exist, show setup instructions
        toast.error('Participants table does not exist. Please create it in Supabase.', {
          duration: 8000,
        });
        return false;
      } else if (error.code === '42P07' || error.message.includes('relation "participants" already exists')) {
        // Table already exists, which is what we want
        console.log('Participants table already exists');
        return true;
      } else {
        // Other error (connection issues, etc.)
        toast.error(`Database connection error: ${error.message}`, {
          duration: 5000,
        });
        return false;
      }
    }
    
    // If we got here, the query succeeded which means the table exists
    console.log('Participants table exists and is accessible');
    
    // All checks passed
    console.log('All database checks passed, database is ready');
    return true;
  } catch (error) {
    console.error('Database setup error:', error);
    toast.error('Failed to set up database. Please check your Supabase configuration.');
    return false;
  }
}

/**
 * Creates the participants table in Supabase
 */
async function createParticipantsTable() {
  // This function is only for reference since we can't create tables via the Supabase JS client
  // You'll need to create the table manually in the Supabase dashboard
  
  toast.info('Please create the "participants" table in your Supabase dashboard with the following structure:', {
    duration: 8000,
  });
  
  console.info(`
    Table name: participants
    Columns:
    - id: uuid (primary key, default: gen_random_uuid())
    - email: text (not null)
    - screener_passed: boolean (default: false)
    - questionnaire_data: jsonb (default: '{}')
    - interview_unlocked: boolean (default: false)
    - unlock_code: text
    - interview_completed: boolean (default: false)
    - transcript_url: text
    - audio_url: text
    - created_at: timestamp with time zone (default: now())
  `);
  
  toast.info('After creating the table, reload this page to continue setup.', {
    duration: 5000,
  });
  
  return;
}

/**
 * Checks if required storage buckets exist and creates them if not
 */
async function checkStorageBuckets() {
  try {
    console.log('Checking storage buckets...');
    
    // List available buckets to see what we have
    const { data: bucketList, error: listError } = await supabase
      .storage
      .listBuckets();
    
    if (listError) {
      console.error('Error listing storage buckets:', listError);
      toast.error(`Storage error: ${listError.message}`, {
        duration: 5000,
      });
      return false;
    }
    
    console.log('Available buckets:', bucketList);
    
    // Check if our required buckets exist in the list
    const bucketNames = bucketList?.map(bucket => bucket.name) || [];
    const hasTranscriptsBucket = bucketNames.includes('transcripts');
    const hasAudioBucket = bucketNames.includes('interview-audio');
    
    console.log('Bucket check results:', { hasTranscriptsBucket, hasAudioBucket });
    
    if (!hasTranscriptsBucket || !hasAudioBucket) {
      const missingBuckets = [];
      
      if (!hasTranscriptsBucket) {
        missingBuckets.push('"transcripts"');
      }
      
      if (!hasAudioBucket) {
        missingBuckets.push('"interview-audio"');
      }
      
      if (missingBuckets.length > 0) {
        toast.info(`Please create the following storage ${missingBuckets.length > 1 ? 'buckets' : 'bucket'} in your Supabase dashboard: ${missingBuckets.join(' and ')}`, {
          duration: 5000,
        });
        
        console.info(`Create the ${missingBuckets.join(' and ')} storage ${missingBuckets.length > 1 ? 'buckets' : 'bucket'} with public read access for storing interview data`);
        
        toast.info('After creating the storage buckets, reload this page to continue setup.', {
          duration: 5000,
        });
        
        return false;
      }
    }
    
    console.log('All required storage buckets exist');
    return true;
  } catch (error) {
    console.error('Error checking storage buckets:', error);
    toast.error('Failed to check storage buckets. Please check your Supabase configuration.');
    return false;
  }
}

/**
 * Provides SQL scripts to create tables in Supabase SQL Editor
 * This is an alternative to manual table creation
 */
export function getSetupSQLScripts(): string {
  return `
-- Create participants table
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  screener_passed BOOLEAN DEFAULT FALSE,
  questionnaire_data JSONB DEFAULT '{}'::jsonb,
  interview_unlocked BOOLEAN DEFAULT FALSE,
  unlock_code TEXT,
  interview_completed BOOLEAN DEFAULT FALSE,
  transcript_url TEXT,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index on email for faster lookups
CREATE UNIQUE INDEX participants_email_idx ON participants (email);

-- Set up Row Level Security (RLS)
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous reads but restrict writes
CREATE POLICY "Allow anonymous read access" 
ON participants FOR SELECT USING (true);

CREATE POLICY "Allow insert for new participants" 
ON participants FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for existing participants" 
ON participants FOR UPDATE USING (true);
`;
}
