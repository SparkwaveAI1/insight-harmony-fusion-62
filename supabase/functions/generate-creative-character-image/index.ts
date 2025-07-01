
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { buildCreativeCharacterImagePrompt } from "./creativePromptBuilder.ts";
import { generateImageWithOpenAI } from "./openaiService.ts";
import { 
  uploadImageToStorage, 
  updateCharacterWithImageUrl,
  saveToCharacterImagesTable 
} from "./creativeCharacterImageUploadService.ts";

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

    // This function only handles creative characters from Character Lab
    if (characterData.creation_source !== 'creative') {
      throw new Error("This function only handles creative characters from Character Lab.");
    }

    console.log("Generating image for creative character:", characterData.name);
    console.log("Entity type:", characterData.character_type);
    console.log("Narrative domain:", characterData.metadata?.narrative_domain);
    console.log("Style:", style);
    console.log("Custom text:", customText);
    console.log("Auto save:", autoSave);

    // Generate creative character prompt
    let imagePrompt = buildCreativeCharacterImagePrompt(characterData, style);
    
    // Add custom text to the prompt if provided
    if (customText && customText.trim()) {
      imagePrompt += `, ${customText.trim()}`;
      console.log("Added custom text to prompt");
    }
    
    console.log("Final generated prompt:", imagePrompt);
    
    // Set up OpenAI parameters for creative imagery
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
          character_type: 'creative'
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
    
    // Save to character_images table for gallery
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
        character_type: 'creative'
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating creative character image:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to generate creative character image",
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
