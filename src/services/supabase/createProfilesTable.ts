
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function createProfilesTable(): Promise<boolean> {
  try {
    console.log('Checking if profiles table exists...');
    
    // Direct approach to check if the profiles table exists - we try to query it
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (!error) {
        console.log('Profiles table already exists');
        return true;
      }
      
      // If the error isn't about the table not existing, something else is wrong
      if (error.code !== '42P01' && !error.message.includes('relation "profiles" does not exist')) {
        console.error('Unexpected error checking profiles table:', error);
        return false;
      }
    } catch (err) {
      console.error('Error checking profiles table:', err);
    }
    
    console.log('Creating profiles table...');
    
    // Execute the SQL script to create the profiles table
    try {
      // We can't directly execute SQL from the client, so we display instructions
      toast.info('Profiles table needs to be created. Please run the SQL script in Supabase SQL Editor.', {
        duration: 8000,
      });
      
      console.info(getProfilesTableSQL());
      
      toast.info('After running the SQL, reload this page to continue setup.', {
        duration: 5000,
      });
      
      return false;
    } catch (error) {
      console.error('Error creating profiles table:', error);
      toast.error('An unexpected error occurred while setting up profiles table.');
      return false;
    }
  } catch (error) {
    console.error('Error creating profiles table:', error);
    toast.error('An unexpected error occurred while setting up profiles table.');
    return false;
  }
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
