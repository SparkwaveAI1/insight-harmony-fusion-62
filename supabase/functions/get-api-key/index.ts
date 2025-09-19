import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { service } = await req.json();

    if (!service) {
      return new Response(
        JSON.stringify({ error: 'Service parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let apiKey;
    
    switch (service) {
      case 'openai':
        apiKey = Deno.env.get('OPENAI_API_KEY');
        break;
      case 'grok':
        apiKey = Deno.env.get('GROK_API_KEY');
        break;
      case 'gemini':
        apiKey = Deno.env.get('GEMINI_API_KEY');
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Unsupported service: ${service}` }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }

    if (!apiKey) {
      console.error(`${service.toUpperCase()} API key not found in environment variables`);
      return new Response(
        JSON.stringify({ error: `${service.toUpperCase()} API key not configured` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ apiKey }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in get-api-key function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});