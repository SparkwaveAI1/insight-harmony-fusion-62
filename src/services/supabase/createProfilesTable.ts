
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function createProfilesTable(): Promise<boolean> {
  try {
    console.log('Checking if profiles table exists...');
    console.log('Supabase client type:', typeof supabase);
    console.log('Supabase rpc method type:', typeof supabase.rpc);
    
    // Fix: Use proper typing for the RPC call
    const { data, error } = await supabase.rpc(
      'table_exists', 
      { table_name: 'profiles' } as { table_name: string }
    );
    
    console.log('RPC response data:', data);
    console.log('RPC response error:', error);
    
    if (error) {
      // If the RPC fails, we'll try a fallback approach - try to execute a count query
      console.log('RPC method failed, trying direct check...');
      
      const { count, error: countError } = await supabase
        .from('participants') // Use a table we know exists
        .select('*', { count: 'exact', head: true }); // Just to check connection
      
      console.log('Fallback check count:', count);
      console.log('Fallback check error:', countError);
      
      if (countError) {
        // There's a connection issue
        console.error('Database connection error:', countError);
        toast.error('Cannot connect to database. Please check your connection.');
        return false;
      }
      
      // Since we couldn't use a direct check, we'll assume the table doesn't exist
      // and show instructions to create it
      console.log('Profiles table likely does not exist, showing instructions...');
      displayProfileCreationInstructions();
      return false;
    }
    
    // If the RPC succeeds, check the result
    console.log('RPC data structure:', JSON.stringify(data));
    
    if (data && typeof data === 'object') {
      // Cast the data to the expected type
      const result = data as { exists: boolean };
      const exists = result.exists;
      
      console.log('Table exists check result:', exists);
      if (exists) {
        console.log('Profiles table already exists');
        return true;
      } else {
        console.log('Profiles table does not exist, showing instructions...');
        displayProfileCreationInstructions();
        return false;
      }
    } else {
      console.log('Unexpected data structure from RPC:', data);
      displayProfileCreationInstructions();
      return false;
    }
  } catch (error) {
    console.error('Error checking profiles table:', error);
    toast.error('An unexpected error occurred while checking the profiles table.');
    return false;
  }
}

function displayProfileCreationInstructions() {
  toast.info('Profiles table needs to be created. Please run the SQL script in Supabase SQL Editor.', {
    duration: 8000,
  });
  
  console.info(getProfilesTableSQL());
  
  toast.info('After running the SQL, reload this page to continue setup.', {
    duration: 5000,
  });
}

export function getProfilesTableSQL(): string {
  return `
-- Create profiles table to store user profile information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read all profiles
CREATE POLICY IF NOT EXISTS "Allow users to read all profiles" 
ON public.profiles FOR SELECT USING (true);

-- Create policy to allow users to update their own profile
CREATE POLICY IF NOT EXISTS "Allow users to update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create trigger to set updated_at on update
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to profiles table
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create a trigger function to create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger when a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`;
}
