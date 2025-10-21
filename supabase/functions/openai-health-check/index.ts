import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 [HEALTH-CHECK] Starting OpenAI API health check...');
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('❌ [HEALTH-CHECK] OPENAI_API_KEY not found in environment');
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: { 
            type: 'configuration_error',
            message: 'OPENAI_API_KEY not configured in Supabase secrets'
          }
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('🔑 [HEALTH-CHECK] API key found, making test request...');

    // Make a minimal test call to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'user', content: 'Hi' }
        ],
        max_tokens: 5,
      }),
    });

    const responseText = await response.text();
    console.log(`📡 [HEALTH-CHECK] OpenAI response status: ${response.status}`);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText };
      }

      console.error('❌ [HEALTH-CHECK] OpenAI API error:', JSON.stringify(errorData, null, 2));

      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: {
            type: errorData.error?.type || 'unknown_error',
            code: errorData.error?.code || response.status,
            message: errorData.error?.message || responseText,
            status: response.status
          }
        }),
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const data = JSON.parse(responseText);
    console.log('✅ [HEALTH-CHECK] OpenAI API is working correctly!');
    console.log(`📊 [HEALTH-CHECK] Model: ${data.model}, Usage: ${JSON.stringify(data.usage)}`);

    return new Response(
      JSON.stringify({ 
        ok: true, 
        model: data.model,
        usage: data.usage,
        message: 'OpenAI API key is valid and has available quota'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ [HEALTH-CHECK] Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: {
          type: 'internal_error',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
