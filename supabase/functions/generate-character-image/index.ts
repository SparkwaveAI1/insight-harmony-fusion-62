
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { buildCharacterImagePrompt } from "./promptBuilder.ts";
import { buildCreativeCharacterImagePrompt, IMAGE_STYLES } from "./creativePromptBuilder.ts";
import { buildHistoricalCharacterImagePrompt } from "./historicalPromptBuilder.ts";
import { generateImageWithOpenAI } from "./openaiService.ts";
import { 
  uploadImageToStorage, 
  updateCharacterWithImageUrl,
  saveToCharacterImagesTable 
} from "./imageUploadService.ts";

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

    console.log("Generating image for character:", characterData.name);
    console.log("Character type:", characterData.character_type);
    console.log("Style:", style);
    console.log("Custom text:", customText);
    console.log("Reference image:", referenceImageUrl);
    console.log("Auto save:", autoSave);
    console.log("Has appearance_prompt:", !!characterData.appearance_prompt);

    let imagePrompt: string;
    let openaiParams: any = {
      model: "dall-e-3",
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
      quality: "hd",
      style: "natural"
    };

    // If we have a reference image, use a simple prompt approach
    if (referenceImageUrl) {
      console.log("Using reference image - generating simple prompt");
      
      // Simple prompt: character name + custom text + style modifiers
      imagePrompt = `${characterData.name}`;
      
      if (customText && customText.trim()) {
        imagePrompt += `, ${customText.trim()}`;
      }
      
      // Add basic style guidance based on selected style
      const styleConfig = IMAGE_STYLES[style];
      if (styleConfig && styleConfig.promptModifiers) {
        imagePrompt += `, ${styleConfig.promptModifiers.join(', ')}`;
      } else if (style === 'photorealistic') {
        imagePrompt += ', photorealistic, high quality, detailed';
      } else if (style === 'cinematic') {
        imagePrompt += ', cinematic, dramatic lighting, movie style';
      } else if (style === 'artistic') {
        imagePrompt += ', artistic, painterly style, creative composition';
      }
      
      // Add reference image guidance
      imagePrompt += ', using similar visual style and composition as reference';
      
      // Apply style-specific OpenAI parameters if available
      if (styleConfig) {
        openaiParams.quality = styleConfig.quality || "hd";
        openaiParams.style = styleConfig.openaiStyle || "natural";
      }
      
      console.log("Reference-based prompt:", imagePrompt);
    } else if (characterData.appearance_prompt && 
               (characterData.metadata?.created_via === 'creative_genesis' || 
                characterData.character_type === 'fictional' ||
                characterData.character_type === 'multi_species')) {
      // Use the pre-generated appearance prompt for creative characters
      console.log("Using pre-generated appearance prompt for creative character");
      imagePrompt = characterData.appearance_prompt;
      
      // Add custom text if provided
      if (customText && customText.trim()) {
        imagePrompt += `, ${customText.trim()}`;
        console.log("Added custom text to pre-generated prompt");
      }
      
      // Apply style-specific modifications for creative characters
      const styleConfig = IMAGE_STYLES[style];
      if (styleConfig) {
        openaiParams.quality = styleConfig.quality || "hd";
        openaiParams.style = styleConfig.openaiStyle || "natural";
        
        // Add style-specific modifiers if they don't conflict with the appearance prompt
        if (styleConfig.promptModifiers && !imagePrompt.includes('photorealistic')) {
          imagePrompt += `, ${styleConfig.promptModifiers.join(', ')}`;
        }
      }
      
      console.log("Using appearance prompt:", imagePrompt);
    } else {
      // No reference image and no appearance prompt - use character-type-specific prompt generation
      if (characterData.character_type === 'historical') {
        console.log("Processing historical character");
        imagePrompt = buildHistoricalCharacterImagePrompt(characterData);
      } else if (characterData.character_type === 'fictional' || 
                 characterData.character_type === 'multi_species' ||
                 characterData.metadata?.created_via === 'creative_genesis') {
        console.log("Processing creative/fictional character with creative prompt builder");
        imagePrompt = buildCreativeCharacterImagePrompt(characterData, style);
        
        // Apply style-specific OpenAI parameters for creative characters
        const styleConfig = IMAGE_STYLES[style];
        if (styleConfig) {
          openaiParams.quality = styleConfig.quality || "hd";
          openaiParams.style = styleConfig.openaiStyle || "natural";
        }
      } else {
        // Fallback to the original prompt builder for any other types
        console.log("Processing character with fallback prompt builder");
        imagePrompt = buildCharacterImagePrompt(characterData);
      }

      // Add custom text to the prompt if provided
      if (customText && customText.trim()) {
        imagePrompt += `, ${customText.trim()}`;
        console.log("Added custom text to prompt");
      }
    }
    
    console.log("Final generated prompt:", imagePrompt);
    
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
          character_type: characterData.character_type
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
      publicUrl, // Use storage URL as original URL since we're storing it
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
        character_type: characterData.character_type
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
