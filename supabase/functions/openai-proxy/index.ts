
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Constants
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
const RATE_LIMIT_REQUESTS = 60; // Number of requests allowed per time window
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window

// Rate limiting storage
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client with service role key for admin privileges
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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
    
    // Verify the JWT token and get user information
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Authentication error:", authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const userId = user.id;
    
    // Apply rate limiting
    const now = Date.now();
    const userRateLimit = rateLimitMap.get(userId) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };
    
    // Reset counter if the time window has passed
    if (now > userRateLimit.resetTime) {
      userRateLimit.count = 0;
      userRateLimit.resetTime = now + RATE_LIMIT_WINDOW_MS;
    }
    
    // Check if rate limit is exceeded
    if (userRateLimit.count >= RATE_LIMIT_REQUESTS) {
      const retryAfterSeconds = Math.ceil((userRateLimit.resetTime - now) / 1000);
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded', 
          message: `Too many requests. Try again in ${retryAfterSeconds} seconds.` 
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': `${retryAfterSeconds}`
          } 
        }
      );
    }
    
    // Parse request data
    const { endpoint, payload } = await req.json();
    
    if (!endpoint || !payload) {
      throw new Error('Missing required parameters: endpoint and payload');
    }
    
    // Validate endpoint (only allow specific OpenAI endpoints)
    const allowedEndpoints = [
      'chat/completions',
      'audio/transcriptions',
      'audio/speech'
    ];
    
    if (!allowedEndpoints.some(e => endpoint.includes(e))) {
      throw new Error(`Endpoint not allowed: ${endpoint}`);
    }
    
    // Construct the full OpenAI API URL
    const openaiUrl = `https://api.openai.com/v1/${endpoint}`;
    
    // Forward the request to OpenAI
    const response = await fetch(openaiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    // Increment rate limit counter and store it
    userRateLimit.count++;
    rateLimitMap.set(userId, userRateLimit);
    
    // Log the request for monitoring
    console.log(`User ${userId} made request to ${endpoint}. Rate limit: ${userRateLimit.count}/${RATE_LIMIT_REQUESTS}`);
    
    // Handle error responses from OpenAI
    if (!response.ok) {
      const errorData = await response.text();
      console.error(`OpenAI API error (${response.status}):`, errorData);
      
      return new Response(
        JSON.stringify({ 
          error: `OpenAI API error: ${response.status}`,
          details: errorData
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Return successful response
    const data = await response.json();
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in openai-proxy function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
