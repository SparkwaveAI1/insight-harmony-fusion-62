
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { buildImagePrompt } from "./promptBuilder.ts";
import { generateImageWithOpenAI } from "./openaiService.ts";
import { uploadImageToStorage, updatePersonaWithImageUrl } from "./imageUploadService.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured in environment variables");
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
    
    // Generate image with OpenAI
    const base64Image = await generateImageWithOpenAI(imagePrompt, OPENAI_API_KEY);
    
    // Upload image to Supabase storage
    const publicUrl = await uploadImageToStorage(
      base64Image, 
      personaData.persona_id, 
      SUPABASE_URL, 
      SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Update the persona record with the new image URL
    await updatePersonaWithImageUrl(
      personaData.persona_id, 
      publicUrl, 
      SUPABASE_URL, 
      SUPABASE_SERVICE_ROLE_KEY
    );
    
    return new Response(
      JSON.stringify({
        success: true,
        image_url: publicUrl,
        prompt: imagePrompt
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating persona image:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to generate persona image",
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
