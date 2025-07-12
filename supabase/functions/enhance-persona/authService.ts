import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { PersonaGenerationError } from "./errorHandler.ts";

// Initialize Supabase client for user validation
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function validateUserAuthentication(authHeader: string | null): Promise<{ user: any; supabase: any }> {
  if (!authHeader) {
    throw new PersonaGenerationError('authentication', 'Authentication required');
  }

  // Verify the JWT token and get user
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    throw new PersonaGenerationError('authentication', 'Invalid authentication token');
  }

  return { user, supabase };
}