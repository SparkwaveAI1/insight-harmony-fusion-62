
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { buildCharacterImagePrompt } from "./promptBuilder.ts";
import { buildNonHumanoidImagePrompt, IMAGE_STYLES } from "./nonHumanoidPromptBuilder.ts";
import { generateImageWithOpenAI } from "./openaiService.ts";
import { uploadImageToStorage, updateCharacterWithImageUrl } from "./imageUploadService.ts";

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

    const { characterData, style = 'photorealistic' } = await req.json();
    
    if (!characterData || typeof characterData !== "object") {
      throw new Error("Invalid characterData provided");
    }

    console.log("Generating image for character:", characterData.name);
    console.log("Character type:", characterData.character_type);
    console.log("Species type:", characterData.species_type);
    console.log("Style:", style);

    // Determine if this is a non-humanoid character
    const isNonHumanoid = characterData.character_type === 'multi_species' || 
                          'species_type' in characterData;

    // Build the image prompt based on character type
    let imagePrompt: string;
    let openaiParams: any = {
      model: "dall-e-3",
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
      quality: "hd",
      style: "natural"
    };

    if (isNonHumanoid) {
      console.log("Processing non-humanoid character");
      imagePrompt = buildNonHumanoidImagePrompt(characterData, style);
      
      // Apply style-specific OpenAI parameters
      const styleConfig = IMAGE_STYLES[style];
      if (styleConfig) {
        openaiParams.quality = styleConfig.quality || "hd";
        openaiParams.style = styleConfig.openaiStyle || "natural";
      }
    } else {
      console.log("Processing humanoid character");
      imagePrompt = buildCharacterImagePrompt(characterData);
    }
    
    console.log("Generated prompt:", imagePrompt);
    
    // Generate image with OpenAI
    const base64Image = await generateImageWithOpenAI(imagePrompt, OPENAI_API_KEY, openaiParams);
    
    // Upload image to Supabase storage
    const publicUrl = await uploadImageToStorage(
      base64Image, 
      characterData.character_id, 
      SUPABASE_URL, 
      SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Update the character record with the new image URL
    await updateCharacterWithImageUrl(
      characterData.character_id, 
      publicUrl, 
      SUPABASE_URL, 
      SUPABASE_SERVICE_ROLE_KEY
    );
    
    return new Response(
      JSON.stringify({
        success: true,
        image_url: publicUrl,
        prompt: imagePrompt,
        style: style,
        character_type: isNonHumanoid ? 'non-humanoid' : 'humanoid'
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating character image:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to generate character image",
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
