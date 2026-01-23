import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[openai-proxy] No authorization header');
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify JWT
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('[openai-proxy] Authentication failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[openai-proxy] Authenticated user: ${user.id}`);

    if (!OPENAI_API_KEY) {
      console.error('[openai-proxy] OpenAI API key not configured');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured on server' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { endpoint, payload } = await req.json();

    if (!endpoint || !payload) {
      return new Response(
        JSON.stringify({ error: 'endpoint and payload are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[openai-proxy] Processing request for endpoint: ${endpoint}`);

    // Handle different OpenAI endpoints
    let openaiUrl: string;
    let responseFormat: 'json' | 'binary' = 'json';

    switch (endpoint) {
      case 'chat/completions':
        openaiUrl = 'https://api.openai.com/v1/chat/completions';
        break;
      case 'audio/speech':
        openaiUrl = 'https://api.openai.com/v1/audio/speech';
        responseFormat = 'binary';
        break;
      case 'embeddings':
        openaiUrl = 'https://api.openai.com/v1/embeddings';
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Unsupported endpoint: ${endpoint}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Make the request to OpenAI
    const openaiResponse = await fetch(openaiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => null);
      console.error(`[openai-proxy] OpenAI error:`, errorData);
      return new Response(
        JSON.stringify({ 
          error: errorData?.error?.message || 'OpenAI request failed',
          status: openaiResponse.status 
        }),
        { status: openaiResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle binary response (audio)
    if (responseFormat === 'binary') {
      const audioBuffer = await openaiResponse.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
      
      return new Response(
        JSON.stringify({ audio: base64Audio }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle JSON response
    const data = await openaiResponse.json();
    console.log(`[openai-proxy] Successfully processed request for ${endpoint}`);
    
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[openai-proxy] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
