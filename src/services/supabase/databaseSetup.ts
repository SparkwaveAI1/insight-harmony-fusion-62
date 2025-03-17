
import { supabase } from './supabaseService';
import { toast } from 'sonner';

/**
 * Checks if the required tables exist in the Supabase database
 * and creates them if they don't
 */
export async function ensureTablesExist(): Promise<boolean> {
  try {
    // Check if participants table exists
    const { data: tables, error } = await supabase
      .from('participants')
      .select('id')
      .limit(1);
    
    if (error && error.code === '42P01') {
      // Table doesn't exist, create it
      await createParticipantsTable();
      return true;
    } else if (error) {
      console.error('Error checking participants table:', error);
      toast.error('Database connection error. Please check your configuration.');
      return false;
    }
    
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
  
  return;
}
