
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { buildHistoricalCharacterImagePrompt } from "./historicalPromptBuilder.ts";
import { generateImageWithOpenAI } from "./openaiService.ts";
import { 
  uploadImageToStorage, 
  updateCharacterWithImageUrl,
  saveToCharacterImagesTable 
} from "./characterImageUploadService.ts";

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

    const { 
      characterData, 
      style = 'photorealistic', 
      customText = '', 
      referenceImageUrl = null,
      autoSave = true 
    } = await req.json();
    
    if (!characterData || typeof characterData !== "object") {
      throw new Error("Invalid characterData provided");
    }

    // This function now only handles historical characters
    if (characterData.character_type !== 'historical') {
      throw new Error("This function only handles historical characters. Use generate-nonhumanoid-character-image for non-humanoid characters.");
    }

    console.log("Generating image for historical character:", characterData.name);
    console.log("Historical period:", characterData.historical_period);
    console.log("Cultural context:", characterData.trait_profile?.cultural_context);
    console.log("Style:", style);
    console.log("Custom instructions from Additional Details field:", customText);
    console.log("Auto save:", autoSave);

    // Generate historical character prompt WITH prioritized custom text integration
    const imagePrompt = buildHistoricalCharacterImagePrompt(characterData, style, customText);
    
    console.log("Final generated prompt with integrated custom instructions:", imagePrompt);
    
    // Set up OpenAI parameters for historical accuracy
    const openaiParams = {
      model: "dall-e-3",
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
      quality: "hd",
      style: style === 'cinematic' ? "vivid" : "natural"
    };
    
    // Generate image with OpenAI
    const base64Image = await generateImageWithOpenAI(imagePrompt, OPENAI_API_KEY, openaiParams);
    
    if (!autoSave) {
      // Return the image data for preview without saving
      const imageDataUrl = `data:image/png;base64,${base64Image}`;
      return new Response(
        JSON.stringify({
          success: true,
          image_url: imageDataUrl,
          prompt: imagePrompt,
          style: style,
          character_type: 'historical'
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Upload image to Supabase storage (for auto-save)
    const publicUrl = await uploadImageToStorage(
      base64Image, 
      characterData.character_id, 
      SUPABASE_URL, 
      SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Extract file path from the public URL
    const filePath = publicUrl.split('/').slice(-1)[0];
    
    // ALWAYS save to character_images table for gallery (this was missing!)
    await saveToCharacterImagesTable(
      characterData.character_id,
      publicUrl,
      filePath,
      publicUrl,
      imagePrompt,
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Update the character record with the new image URL (as profile image)
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
        character_type: 'historical'
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating historical character image:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to generate historical character image",
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
