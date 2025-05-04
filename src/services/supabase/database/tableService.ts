import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ensureStorageBuckets } from '../storage/bucketService';

/**
 * Checks if the required tables exist in the Supabase database
 * and creates them if they don't
 */
export async function ensureTablesExist(): Promise<boolean> {
  try {
    console.log('Starting complete database check...');
    
    // First check if we can connect to Supabase at all
    try {
      // Instead of directly accessing the supabaseUrl property, we'll use the URL from the service file
      console.log('Checking Supabase connection...');
      // Replace the RPC call with a simpler query to test connection
      const { error: healthError } = await supabase
        .from('participants')
        .select('count(*)')
        .limit(1);
      
      if (healthError) {
        console.error('Supabase connection error:', healthError);
        // If we can't connect, try to create the buckets manually instead of failing
        console.log('Attempting to create storage buckets directly...');
        await ensureStorageBuckets();
      } else {
        console.log('Supabase connection is healthy');
      }
    } catch (healthErr) {
      // API might not exist, which is fine, we'll try direct API calls
      console.log('Health check not available, continuing with direct checks');
    }
    
    // Create storage buckets if they don't exist
    const bucketsReady = await ensureStorageBuckets();
    if (!bucketsReady) {
      console.log('Failed to ensure storage buckets');
      return false;
    }

    // Now check if participants table exists
    console.log('Checking participants table...');
    try {
      const { data: tables, error } = await supabase
        .from('participants')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('Error checking participants table:', error);
        
        if (error.code === '42P01' || error.message.includes('relation "participants" does not exist')) {
          // Table doesn't exist
          toast.error('Participants table does not exist. Please create it in Supabase.', {
            duration: 8000,
          });
          return false;
        } else if (error.code === '42P07' || error.message.includes('relation "participants" already exists')) {
          // Table already exists, which is what we want
          console.log('Participants table exists (code indicated)');
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
      console.log('Participants table exists and accessible ✅');
      return true;
    } catch (tableErr) {
      console.error('Exception during table check:', tableErr);
      
      // As a fallback, try to query another way
      try {
        // Use a direct query to check table existence instead of RPC
        const { data, error: tablesError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
          .eq('table_type', 'BASE TABLE');
        
        if (!tablesError && data) {
          const tableNames = data.map(t => t.table_name);
          if (tableNames.includes('participants')) {
            console.log('Participants table exists (alternate check) ✅');
            return true;
          }
        }
      } catch (fallbackErr) {
        // Fallback didn't work either
      }
      
      toast.error('Could not verify database setup. Please check your Supabase configuration.');
      return false;
    }
  } catch (error) {
    console.error('Database setup error:', error);
    toast.error('Failed to set up database. Please check your Supabase configuration.');
    return false;
  }
}

/**
 * Creates the participants table in Supabase
 * This function is only for reference since we can't create tables via the Supabase JS client
 * You'll need to create the table manually in the Supabase dashboard
 */
export function displayParticipantsTableInfo() {
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
}
