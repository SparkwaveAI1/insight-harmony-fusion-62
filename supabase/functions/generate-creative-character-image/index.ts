
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

    // Extract auth token from request headers with enhanced mobile support
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error("No valid authorization header found");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Authentication required - please sign in again",
        }),
        { 
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const userToken = authHeader.replace('Bearer ', '');
    console.log("User token extracted, length:", userToken.length);

    // Create Supabase client with enhanced error handling for mobile
    const userSupabase = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: {
        headers: { Authorization: authHeader }
      },
      auth: {
        persistSession: true,
        detectSessionInUrl: false
      }
    });

    // Enhanced user authentication with retry logic for mobile
    let user;
    let authAttempts = 0;
    const maxAuthAttempts = 3;

    while (authAttempts < maxAuthAttempts) {
      try {
        const { data: { user: authUser }, error: authError } = await userSupabase.auth.getUser(userToken);
        
        if (authError) {
          console.error(`Authentication attempt ${authAttempts + 1} failed:`, authError);
          
          // Try refreshing the session for mobile compatibility
          if (authAttempts < maxAuthAttempts - 1) {
            console.log("Attempting session refresh...");
            const { data: refreshData, error: refreshError } = await userSupabase.auth.refreshSession();
            
            if (!refreshError && refreshData.session) {
              console.log("Session refreshed successfully");
              user = refreshData.user;
              break;
            }
          }
          
          authAttempts++;
          if (authAttempts >= maxAuthAttempts) {
            throw new Error("Session expired - please sign in again");
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }

        if (!authUser) {
          throw new Error("User not found - please sign in again");
        }

        user = authUser;
        break;
      } catch (error) {
        authAttempts++;
        if (authAttempts >= maxAuthAttempts) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log("User authenticated:", user.id);

    const requestBody = await req.json();
    console.log("Request body received");

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

    // Enhanced character ownership verification with retry logic
    let characterOwnership;
    let ownershipAttempts = 0;
    const maxOwnershipAttempts = 3;

    while (ownershipAttempts < maxOwnershipAttempts) {
      try {
        const { data, error } = await userSupabase
          .from('characters')
          .select('user_id, name')
          .eq('character_id', characterData.character_id)
          .eq('creation_source', 'creative')
          .single();

        if (error) {
          if (ownershipAttempts < maxOwnershipAttempts - 1) {
            console.log(`Ownership verification attempt ${ownershipAttempts + 1} failed, retrying...`);
            ownershipAttempts++;
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          throw new Error('Character not found or access denied');
        }

        characterOwnership = data;
        break;
      } catch (error) {
        ownershipAttempts++;
        if (ownershipAttempts >= maxOwnershipAttempts) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
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
    
    // Enhanced error responses for mobile clients
    let statusCode = 500;
    let errorMessage = error.message || "Failed to generate creative character image";

    if (error.message?.includes('Authentication') || 
        error.message?.includes('Session expired') || 
        error.message?.includes('sign in again')) {
      statusCode = 401;
      errorMessage = "Your session has expired. Please sign in again and try generating the image.";
    } else if (error.message?.includes('access denied') || 
               error.message?.includes('your own characters')) {
      statusCode = 403;
      errorMessage = "You can only generate images for your own characters.";
    } else if (error.message?.includes('Character not found')) {
      statusCode = 404;
      errorMessage = "Character not found. Please make sure the character exists and try again.";
    } else if (error.message?.includes('network') || error.message?.includes('timeout')) {
      statusCode = 503;
      errorMessage = "Network error occurred. Please check your connection and try again.";
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        code: statusCode
      }),
      { 
        status: statusCode,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
