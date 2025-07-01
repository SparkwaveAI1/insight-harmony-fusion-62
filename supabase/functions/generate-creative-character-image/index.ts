
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
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
    console.log("Starting creative character image generation...");
    
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is missing");
      throw new Error("OPENAI_API_KEY is not configured in environment variables");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Supabase configuration is missing");
      throw new Error("Supabase configuration is missing");
    }

    // Extract auth token from request headers
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error("No valid authorization header found");
      throw new Error("Authentication required");
    }

    const userToken = authHeader.replace('Bearer ', '');
    console.log("User token extracted, length:", userToken.length);

    // Create Supabase client with user's token for authentication
    const userSupabase = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: {
        headers: { Authorization: authHeader }
      }
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await userSupabase.auth.getUser(userToken);
    if (authError || !user) {
      console.error("Authentication failed:", authError);
      throw new Error("Invalid authentication token");
    }

    console.log("User authenticated:", user.id);

    const requestBody = await req.json();
    console.log("Request body received:", JSON.stringify(requestBody, null, 2));

    const { 
      characterData, 
      style = 'photorealistic', 
      customText = '', 
      referenceImageUrl = null,
      autoSave = true 
    } = requestBody;
    
    if (!characterData || typeof characterData !== "object") {
      throw new Error("Invalid characterData provided");
    }

    // Verify this is a creative character
    if (characterData.creation_source !== 'creative') {
      throw new Error("This function only handles creative characters from Character Lab.");
    }

    console.log("Processing creative character:", characterData.name);
    console.log("Character ID:", characterData.character_id);

    // CRITICAL: Verify character ownership using user's authenticated client
    const { data: characterOwnership, error: ownershipError } = await userSupabase
      .from('characters')
      .select('user_id, name')
      .eq('character_id', characterData.character_id)
      .eq('creation_source', 'creative')
      .single();

    if (ownershipError) {
      console.error('Character ownership verification failed:', ownershipError);
      throw new Error('Character not found or access denied');
    }

    if (characterOwnership.user_id !== user.id) {
      console.error('Ownership mismatch:', {
        characterUserId: characterOwnership.user_id,
        requestUserId: user.id,
        characterName: characterOwnership.name
      });
      throw new Error('You can only generate images for your own characters');
    }

    console.log('Character ownership verified for user:', user.id);
    console.log("Style:", style);
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
    
    console.log("Calling OpenAI with parameters:", openaiParams);
    
    // Generate image with OpenAI
    const base64Image = await generateImageWithOpenAI(imagePrompt, OPENAI_API_KEY, openaiParams);
    
    if (!autoSave) {
      // Return the image data for preview without saving
      const imageDataUrl = `data:image/png;base64,${base64Image}`;
      console.log("Returning preview image (not saving)");
      
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
    
    console.log("Uploading image to storage...");
    
    // Use service role client for storage operations (but character ownership is already verified)
    const publicUrl = await uploadImageToStorage(
      base64Image, 
      characterData.character_id, 
      SUPABASE_URL, 
      SUPABASE_SERVICE_ROLE_KEY
    );
    
    console.log("Image uploaded, public URL:", publicUrl);
    
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
    
    console.log("Image saved to gallery table");
    
    // Update the character record with the new image URL (as profile image)
    await updateCharacterWithImageUrl(
      characterData.character_id, 
      publicUrl, 
      SUPABASE_URL, 
      SUPABASE_SERVICE_ROLE_KEY
    );
    
    console.log("Character updated with new image URL");
    
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
    console.error("Error stack:", error.stack);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to generate creative character image",
      }),
      { 
        status: error.message?.includes('Authentication') || error.message?.includes('access denied') || error.message?.includes('your own characters') ? 403 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
