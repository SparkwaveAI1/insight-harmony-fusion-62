
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { buildImagePrompt } from "./promptBuilder.ts";
import { generateImageWithGemini } from "./geminiService.ts";
import { uploadImageWithThumbnail, updatePersonaWithImageUrl } from "./imageUploadService.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured in environment variables");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration is missing");
    }

    const { personaData } = await req.json();
    
    if (!personaData || typeof personaData !== "object") {
      throw new Error("Invalid personaData provided");
    }

    // Build the image prompt
    const imagePrompt = buildImagePrompt(personaData);
    
    // Generate image with Gemini
    const base64Image = await generateImageWithGemini(imagePrompt, GEMINI_API_KEY);
    
    // Upload image to Supabase storage (both full and thumbnail)
    const { fullUrl, thumbnailUrl } = await uploadImageWithThumbnail(
      base64Image,
      personaData.persona_id,
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );
    
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
