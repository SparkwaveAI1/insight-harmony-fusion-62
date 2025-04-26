
import { supabase } from './supabaseService';
import { toast } from 'sonner';

export async function createProfilesTable(): Promise<boolean> {
  try {
    console.log('Checking if profiles table exists...');
    // When calling rpc with no parameters, we must provide an empty object as the second argument
    const { data, error } = await supabase.rpc('get_tables', {});
    
    if (error) {
      console.error('Error getting tables:', error);
      return false;
    }
    
    // Check if profiles table already exists
    if (data && Array.isArray(data) && data.includes('profiles')) {
      console.log('Profiles table already exists');
      return true;
    }
    
    console.log('Creating profiles table...');
    // Execute the SQL query to create the profiles table
    const { error: createError } = await supabase.sql(getProfilesTableSQL());
    
    if (createError) {
      console.error('Error creating profiles table:', createError);
      toast.error('Failed to create profiles table. Please check your Supabase configuration.');
      return false;
    }
    
    console.log('Profiles table created successfully');
    return true;
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
