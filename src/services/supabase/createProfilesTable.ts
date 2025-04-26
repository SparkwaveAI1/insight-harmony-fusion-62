
import { supabase } from "@/integrations/supabase/client";

export const createProfilesTable = async () => {
  const { error } = await supabase.rpc('create_profiles_table_if_not_exists');
  
  if (error) {
    console.error('Error creating profiles table:', error);
    throw error;
  }
  
  return true;
};

export const getProfilesTableSQL = () => `
-- Function to create profiles table if it doesn't exist
create or replace function public.create_profiles_table_if_not_exists()
returns boolean
language plpgsql
security definer
as $$
begin
  -- Create profiles table if it doesn't exist
  create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text,
    auth_provider text,
    created_at timestamp with time zone default now(),
    last_login timestamp with time zone default now()
  );

  -- Enable Row Level Security
  alter table public.profiles enable row level security;

  -- Create policies
  drop policy if exists "Users can view own profile" on public.profiles;
  create policy "Users can view own profile" 
    on public.profiles for select 
    using (auth.uid() = id);

  drop policy if exists "Users can update own profile" on public.profiles;
  create policy "Users can update own profile" 
    on public.profiles for update 
    using (auth.uid() = id);

  -- Create trigger function for new users
  create or replace function public.handle_new_user() 
  returns trigger 
  language plpgsql 
  security definer set search_path = public
  as $$
  declare
    provider_name text;
  begin
    -- Determine auth provider
    if new.email is not null and new.email = new.confirmed_at then
      provider_name := 'email';
    elsif new.app_metadata->>'provider' is not null then
      provider_name := new.app_metadata->>'provider';
    else
      provider_name := 'unknown';
    end if;

    -- Insert into profiles
    insert into public.profiles (id, email, auth_provider, created_at)
    values (
      new.id, 
      new.email, 
      provider_name, 
      now()
    );
    return new;
  end;
  $$;

  -- Create or replace trigger
  drop trigger if exists on_auth_user_created on auth.users;
  create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

  return true;
end;
$$;
`;
