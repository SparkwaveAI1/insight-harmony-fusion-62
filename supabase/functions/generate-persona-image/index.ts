
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimit.ts";
import { buildImagePrompt } from "./promptBuilder.ts";
import { generateImageWithGemini } from "./geminiService.ts";
import { uploadImageWithThumbnail, updatePersonaWithImageUrl } from "./imageUploadService.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Rate limit: 30 requests per minute (admin batch operations need higher throughput)
const RATE_LIMIT_CONFIG = { maxRequests: 30, windowSeconds: 60 };

serve(async (req) => {
  const functionName = 'generate-persona-image';
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration is missing");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Extract user ID from auth header for rate limiting
    const authHeader = req.headers.get('authorization');
    let userId = 'anonymous';
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) userId = user.id;
      } catch (e) {
        console.warn('[generate-persona-image] Could not extract user from token for rate limiting');
      }
    }

    // Check rate limit
    const rateLimitResult = await checkRateLimit(supabase, userId, functionName, RATE_LIMIT_CONFIG);
    if (!rateLimitResult.allowed) {
      console.warn(`[generate-persona-image] Rate limit exceeded for user ${userId}`);
      return rateLimitResponse(rateLimitResult, corsHeaders);
    }

    const { personaData } = await req.json();
    
    if (!personaData || typeof personaData !== "object") {
      throw new Error("Invalid personaData provided");
    }

    if (!personaData.persona_id) {
      throw new Error("personaData.persona_id is required");
    }

    console.log(`[generate-persona-image] Starting for persona: ${personaData.persona_id}`);

    // Build the image prompt
    const imagePrompt = buildImagePrompt(personaData);
    
    // Generate image with Gemini API
    const base64Image = await generateImageWithGemini(imagePrompt, GEMINI_API_KEY || "");
    
    // Upload image to Supabase storage (both full and thumbnail)
    const { fullUrl, thumbnailUrl } = await uploadImageWithThumbnail(
      base64Image,
      personaData.persona_id,
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );

    // Update persona record with new image URLs
    console.log(`[generate-persona-image] Updating persona ${personaData.persona_id} with image URLs`);
    await updatePersonaWithImageUrl(
      personaData.persona_id,
      fullUrl,
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      thumbnailUrl
    );
    console.log(`[generate-persona-image] Successfully updated persona ${personaData.persona_id}`);
    
    return new Response(
      JSON.stringify({
        success: true,
        image_url: fullUrl,
        thumbnail_url: thumbnailUrl,
        prompt: imagePrompt
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating persona image:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? (error.message || "Failed to generate persona image") : "Failed to generate persona image",
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
