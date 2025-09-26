
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract JWT token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header');
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Verify the JWT token and get user information
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Authentication error:", authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get the API key and service from the request body
    const { apiKey, service } = await req.json();
    
    if (!apiKey || !service) {
      throw new Error('API key and service are required');
    }
    
    // Check if there's an existing record for this user and service
    const { data: existingRecord, error: fetchError } = await supabase
      .from('user_api_keys')
      .select('id')
      .eq('user_id', user.id)
      .eq('service', service)
      .maybeSingle();
      
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("Error fetching existing API key:", fetchError);
      throw new Error('Error checking for existing API key');
    }
    
    // Generate encryption key
    const encryptionKey = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
    
    // Export key to ArrayBuffer, then convert to base64 string
    const rawKey = await crypto.subtle.exportKey("raw", encryptionKey);
    const keyBase64 = btoa(String.fromCharCode(...new Uint8Array(rawKey)));
    
    // Generate a random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ivBase64 = btoa(String.fromCharCode(...iv));
    
    // Encrypt the API key
    const encodedApiKey = new TextEncoder().encode(apiKey);
    const encryptedApiKeyBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      encryptionKey,
      encodedApiKey
    );
    const encryptedApiKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(encryptedApiKeyBuffer)));
    
    // Store the encrypted API key in the database
    let dbResult;
    if (existingRecord) {
      // Update existing record
      dbResult = await supabase
        .from('user_api_keys')
        .update({
          encrypted_key: encryptedApiKeyBase64,
          encryption_iv: ivBase64,
          encryption_key: keyBase64,
          key_present: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRecord.id);
    } else {
      // Insert new record
      dbResult = await supabase
        .from('user_api_keys')
        .insert([
          {
            user_id: user.id,
            service,
            encrypted_key: encryptedApiKeyBase64,
            encryption_iv: ivBase64,
            encryption_key: keyBase64,
            key_present: true
          }
        ]);
    }
    
    if (dbResult.error) {
      console.error("Error storing API key:", dbResult.error);
      throw new Error('Failed to store API key');
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in store-api-key function:', error);
    
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unexpected error occurred' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
