
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { corsHeaders } from "../_shared/cors.ts";

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

    console.log("Generating image prompt from persona data");
    
    // Extract demographic information
    const metadata = personaData.metadata || {};
    const traits = personaData.trait_profile || {};
    const description = personaData.prompt || "";
    
    // Extract essential data
    const age = metadata.age || "adult";
    const gender = metadata.gender || "person";
    const ethnicity = metadata.race_ethnicity || "";
    const occupation = metadata.occupation || "";
    
    // Physical attributes that should be explicitly extracted from the description
    let bodyType = "";
    let healthConditions = [];
    let emotionalState = "";
    
    // Parse the original description for physical attributes and health conditions
    if (description) {
      // Check for body type descriptions
      if (description.toLowerCase().includes("overweight") || 
          description.toLowerCase().includes("obese") || 
          description.toLowerCase().includes("heavy") || 
          description.toLowerCase().includes("fat")) {
        bodyType = "overweight";
      } else if (description.toLowerCase().includes("thin") || 
                description.toLowerCase().includes("skinny") || 
                description.toLowerCase().includes("underweight")) {
        bodyType = "thin";
      } else {
        // If not specified, randomly assign overweight to ~50% of personas to match US demographics
        bodyType = Math.random() < 0.5 ? "slightly overweight" : "average weight";
      }
      
      // Check for common health conditions
      const conditionKeywords = {
        "diabetic": "diabetic",
        "diabetes": "with diabetes",
        "asthma": "with asthma",
        "high blood pressure": "with high blood pressure",
        "hypertension": "with hypertension",
        "heart condition": "with a heart condition",
        "obese": "who is obese"
      };
      
      Object.entries(conditionKeywords).forEach(([keyword, condition]) => {
        if (description.toLowerCase().includes(keyword)) {
          healthConditions.push(condition);
        }
      });
      
      // Check for emotional states
      const emotionalKeywords = {
        "depression": "with a slightly sad expression",
        "depressed": "with a slightly sad expression",
        "sad": "with a slightly sad expression",
        "anxious": "with a slightly worried expression",
        "anxiety": "with a slightly worried expression",
        "tired": "looking slightly tired",
        "exhausted": "looking slightly tired",
        "stressed": "looking slightly stressed",
        "happy": "with a warm smile",
        "cheerful": "with a friendly smile",
        "optimistic": "with a positive expression"
      };
      
      Object.entries(emotionalKeywords).forEach(([keyword, state]) => {
        if (description.toLowerCase().includes(keyword)) {
          emotionalState = state;
        }
      });
      
      // Default to neutral expression if none specified
      if (!emotionalState) {
        emotionalState = "with a neutral expression";
      }
    }
    
    // Determine appropriate clothing based on persona traits and occupation
    let clothing = "";
    if (occupation) {
      if (gender.toLowerCase() === "female" || gender.toLowerCase().includes("woman")) {
        // Professional female attire
        if (occupation.toLowerCase().includes("doctor") || 
            occupation.toLowerCase().includes("physician") || 
            occupation.toLowerCase().includes("surgeon")) {
          clothing = "wearing professional women's medical attire like a white coat over a blouse";
        } 
        else if (occupation.toLowerCase().includes("lawyer") || 
                 occupation.toLowerCase().includes("attorney") || 
                 occupation.toLowerCase().includes("executive") ||
                 occupation.toLowerCase().includes("manager")) {
          clothing = "wearing a professional women's business suit or blazer with a blouse";
        }
        else if (occupation.toLowerCase().includes("teacher") || 
                 occupation.toLowerCase().includes("professor")) {
          clothing = "wearing professional casual women's attire with a blouse";
        }
        else if (occupation.toLowerCase().includes("chef") || 
                 occupation.toLowerCase().includes("cook")) {
          clothing = "wearing chef's attire adapted for women";
        }
        else if (occupation.toLowerCase().includes("police") || 
                 occupation.toLowerCase().includes("officer") ||
                 occupation.toLowerCase().includes("security")) {
          clothing = "in a women's professional uniform appropriate for law enforcement";
        }
        else {
          // Default for other occupations
          clothing = "in appropriate professional women's attire including a blouse or top";
        }
      } else {
        // Professional male attire
        if (occupation.toLowerCase().includes("doctor") || 
            occupation.toLowerCase().includes("physician") || 
            occupation.toLowerCase().includes("surgeon")) {
          clothing = "wearing professional men's medical attire like a white coat over a dress shirt";
        } 
        else if (occupation.toLowerCase().includes("lawyer") || 
                 occupation.toLowerCase().includes("attorney") || 
                 occupation.toLowerCase().includes("executive") ||
                 occupation.toLowerCase().includes("manager")) {
          clothing = "wearing a professional men's business suit with a button-up shirt and tie";
        }
        else if (occupation.toLowerCase().includes("teacher") || 
                 occupation.toLowerCase().includes("professor")) {
          clothing = "wearing professional casual men's attire with a collared shirt";
        }
        else if (occupation.toLowerCase().includes("chef") || 
                 occupation.toLowerCase().includes("cook")) {
          clothing = "wearing men's chef attire";
        }
        else if (occupation.toLowerCase().includes("police") || 
                 occupation.toLowerCase().includes("officer") ||
                 occupation.toLowerCase().includes("security")) {
          clothing = "in a men's professional uniform appropriate for law enforcement";
        }
        else {
          // Default for other occupations
          clothing = "in appropriate professional men's attire including a collared shirt";
        }
      }
    } else {
      // Generic clothing if no occupation is specified
      if (gender.toLowerCase() === "female" || gender.toLowerCase().includes("woman")) {
        clothing = "dressed in casual yet professional women's attire";
      } else {
        clothing = "dressed in casual yet professional men's attire";
      }
    }
    
    // Build the base prompt - using "headshot photograph" and emphasizing realism
    let imagePrompt = `Professional headshot photograph of a ${age}-year-old ${ethnicity} ${gender}`;
    
    // Add body type if specified
    if (bodyType) {
      imagePrompt += ` with a ${bodyType} build`;
    }
    
    // Add occupation if available
    if (occupation) {
      imagePrompt += ` who works as a ${occupation}`;
    }
    
    // Add clothing description
    imagePrompt += `, ${clothing}`;
    
    // Add health conditions
    if (healthConditions.length > 0) {
      imagePrompt += `, ${healthConditions.join(", ")}`;
    }
    
    // Add emotional state
    if (emotionalState) {
      imagePrompt += `, ${emotionalState}`;
    }
    
    // Add specific instructions to ensure photorealistic, headshot-style portrait
    imagePrompt += `. IMPORTANT: Create a high-quality, PHOTOREALISTIC professional headshot portrait with a plain, neutral background. Use photographic realism like a professional LinkedIn profile photo. The image must have proper studio lighting, realistic skin texture, and natural facial features. The photo should be well-composed with the subject's face being the main focus, with shoulders visible. THE SUBJECT MUST BE APPROPRIATELY DRESSED FOR THEIR PROFESSION. No cartoon style, no illustration style, no exaggerated features.`;
    
    // Additional specifics for body type
    if (bodyType === "overweight" || bodyType === "slightly overweight") {
      imagePrompt += " The person should have a realistic face with appropriate fullness that suggests their weight, without exaggeration.";
    }
    
    // Add specifics about photo quality
    imagePrompt += " The photograph should look like it was taken by a professional portrait photographer with clean, natural lighting, shallow depth of field, and accurate skin tones. The background should be simple and neutral (like light gray, soft blue, or beige) to make the subject stand out.";
    
    console.log("Generated prompt:", imagePrompt);
    
    // Call the OpenAI Image Generation API requesting base64 format to avoid CORS issues
    console.log("Calling OpenAI API for image generation with base64 format...");
    const imageResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json", // Request base64 instead of URL to avoid CORS
        quality: "hd",
        style: "natural"
      })
    });
    
    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${imageResponse.status}`);
    }
    
    const imageData = await imageResponse.json();
    
    if (!imageData.data || !imageData.data[0] || !imageData.data[0].b64_json) {
      throw new Error("Invalid response from OpenAI image generation");
    }
    
    const base64Image = imageData.data[0].b64_json;
    console.log("Successfully received base64 image from OpenAI");
    
    // Now upload the base64 image directly to Supabase storage
    console.log("Uploading image to Supabase storage");
    
    // Initialize Supabase client with service role key for server-side operations
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Convert base64 to blob
    const imageBuffer = Uint8Array.from(atob(base64Image), c => c.charCodeAt(0));
    const imageBlob = new Blob([imageBuffer], { type: 'image/png' });
    
    // Generate a unique file name
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${personaData.persona_id}_${timestamp}.png`;
    
    console.log(`Uploading to storage with filename: ${fileName}`);
    
    // Upload the image to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('persona-images')
      .upload(fileName, imageBlob, {
        contentType: 'image/png',
        upsert: false,
        cacheControl: '3600'
      });
      
    if (uploadError) {
      console.error('Error uploading image to storage:', uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }
    
    console.log('Successfully uploaded to storage:', uploadData);
    
    // Get the public URL for the uploaded image
    const { data: urlData } = supabase
      .storage
      .from('persona-images')
      .getPublicUrl(fileName);
      
    const publicUrl = urlData.publicUrl;
    console.log('Generated public URL:', publicUrl);
    
    // Update the persona record with the new image URL
    console.log('Updating persona record with new image URL');
    const { error: updateError } = await supabase
      .from('personas')
      .update({ profile_image_url: publicUrl })
      .eq('persona_id', personaData.persona_id);
      
    if (updateError) {
      console.error('Error updating persona with image URL:', updateError);
      throw new Error(`Failed to update persona: ${updateError.message}`);
    }
    
    console.log('Successfully updated persona record');
    
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
