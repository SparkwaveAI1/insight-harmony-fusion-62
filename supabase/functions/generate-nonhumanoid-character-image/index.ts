
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { buildNonHumanoidImagePrompt } from "./nonHumanoidPromptBuilder.ts";
import { generateImageWithOpenAI } from "./openaiService.ts";
import { 
  uploadNonHumanoidImageToStorage, 
  updateNonHumanoidCharacterWithImageUrl,
  saveToNonHumanoidCharacterImagesTable 
} from "./nonHumanoidImageUploadService.ts";

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

    // Ensure this is a non-humanoid character
    if (!characterData.species_type) {
      throw new Error("This function only handles non-humanoid characters. Use generate-character-image for historical characters.");
    }

    console.log("Generating image for non-humanoid character:", characterData.name);
    console.log("Species type:", characterData.species_type);
    console.log("Style:", style);
    console.log("Custom text:", customText);
    console.log("Auto save:", autoSave);

    // Generate non-humanoid character prompt
    let imagePrompt = buildNonHumanoidImagePrompt(characterData, style);
    
    // Add custom text to the prompt if provided
    if (customText && customText.trim()) {
      imagePrompt += `, ${customText.trim()}`;
      console.log("Added custom text to prompt");
    }
    
    console.log("Final generated prompt:", imagePrompt);
    
    // Set up OpenAI parameters
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
          character_type: 'non_humanoid'
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Upload image to Supabase storage (for auto-save)
    const publicUrl = await uploadNonHumanoidImageToStorage(
      base64Image, 
      characterData.character_id, 
      SUPABASE_URL, 
      SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Extract file path from the public URL
    const filePath = publicUrl.split('/').slice(-1)[0];
    
    // ALWAYS save to non_humanoid_character_images table for gallery (this was missing!)
    await saveToNonHumanoidCharacterImagesTable(
      characterData.character_id,
      publicUrl,
      filePath,
      publicUrl,
      imagePrompt,
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Update the character record with the new image URL (as profile image)
    await updateNonHumanoidCharacterWithImageUrl(
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
        character_type: 'non_humanoid'
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating non-humanoid character image:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to generate non-humanoid character image",
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
