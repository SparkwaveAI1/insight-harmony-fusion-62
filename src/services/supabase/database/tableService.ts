
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ensureStorageBuckets } from '../storage/bucketService';

/**
 * Checks if the required tables exist in the Supabase database
 * and creates them if they don't
 */
export async function ensureTablesExist(): Promise<boolean> {
  try {
    console.log('Starting simplified database check...');
    
    // First check if we can connect to Supabase at all
    try {
      console.log('Checking Supabase connection...');
      const { error: healthError } = await supabase
        .from('participants')
        .select('id')
        .limit(1);
      
      if (healthError) {
        console.error('Supabase connection error:', healthError);
        console.log('Attempting to create storage buckets directly...');
        await ensureStorageBuckets();
      } else {
        console.log('Supabase connection is healthy');
      }
    } catch (healthErr) {
      console.log('Health check not available, continuing with direct checks');
    }
    
    // Create storage buckets if they don't exist
    const bucketsReady = await ensureStorageBuckets();
    if (!bucketsReady) {
      console.log('Failed to ensure storage buckets');
      return false;
    }

    // Check core tables exist
    const coreTables = ['participants', 'personas', 'collections', 'conversations', 'projects'];
    
    for (const tableName of coreTables) {
      try {
        const { error } = await supabase
          .from(tableName as any)
          .select('id')
          .limit(1);
        
        if (error && error.code === '42P01') {
          toast.error(`${tableName} table does not exist. Please create it in Supabase.`, {
            duration: 8000,
          });
          return false;
        }
      } catch (tableErr) {
        console.error(`Error checking ${tableName} table:`, tableErr);
      }
    }
      
    console.log('Core database tables exist and accessible ✅');
    return true;
  } catch (error) {
    console.error('Database setup error:', error);
    toast.error('Failed to set up database. Please check your Supabase configuration.');
    return false;
  }
}

/**
 * Checks if a table exists in the database
 * @param tableName The name of the table to check
 */
export async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(tableName as any)
      .select('id')
      .limit(1)
      .maybeSingle();
    
    if (!error) {
      return true;
    }
    
    if (error.code === '42P01' || error.message.includes('relation') && error.message.includes('does not exist')) {
      return false;
    }
    
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  } catch (error) {
    console.error(`Exception checking if table ${tableName} exists:`, error);
    return false;
  }
}
