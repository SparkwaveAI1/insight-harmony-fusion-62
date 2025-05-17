
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured in environment variables");
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
        "depression": "with a sad, tired expression",
        "depressed": "with a sad, tired expression",
        "sad": "with a sad expression",
        "anxious": "with a worried expression",
        "anxiety": "with a worried expression",
        "tired": "looking tired",
        "exhausted": "looking exhausted",
        "stressed": "looking stressed"
      };
      
      Object.entries(emotionalKeywords).forEach(([keyword, state]) => {
        if (description.toLowerCase().includes(keyword)) {
          emotionalState = state;
        }
      });
    }
    
    // Social aspects that might be visible
    let socialDescription = "";
    if (description.toLowerCase().includes("trouble socially") || 
        description.toLowerCase().includes("not many friends") || 
        description.toLowerCase().includes("lonely") ||
        description.toLowerCase().includes("awkward")) {
      socialDescription = "with an uncomfortable, slightly awkward expression";
    }
    
    // Determine appropriate clothing based on occupation
    let clothing = "";
    if (occupation) {
      // Professional occupations
      if (occupation.toLowerCase().includes("doctor") || 
          occupation.toLowerCase().includes("physician") || 
          occupation.toLowerCase().includes("surgeon")) {
        clothing = "wearing professional medical attire like a white coat over business casual clothing";
      } 
      else if (occupation.toLowerCase().includes("lawyer") || 
               occupation.toLowerCase().includes("attorney") || 
               occupation.toLowerCase().includes("executive") ||
               occupation.toLowerCase().includes("manager") ||
               occupation.toLowerCase().includes("business")) {
        clothing = "wearing a professional business suit with a button-up shirt and tie/blouse";
      }
      else if (occupation.toLowerCase().includes("teacher") || 
               occupation.toLowerCase().includes("professor")) {
        clothing = "wearing professional casual attire with a collared shirt/blouse";
      }
      else if (occupation.toLowerCase().includes("chef") || 
               occupation.toLowerCase().includes("cook")) {
        clothing = "wearing chef's attire including a chef coat";
      }
      else if (occupation.toLowerCase().includes("police") || 
               occupation.toLowerCase().includes("officer") ||
               occupation.toLowerCase().includes("security")) {
        clothing = "in a professional uniform with badge and appropriate insignia";
      }
      else if (occupation.toLowerCase().includes("construction") || 
               occupation.toLowerCase().includes("mechanic") ||
               occupation.toLowerCase().includes("technician") ||
               occupation.toLowerCase().includes("engineer") ||
               occupation.toLowerCase().includes("electrician")) {
        clothing = "wearing appropriate workwear including a shirt and safety equipment";
      }
      else if (occupation.toLowerCase().includes("athlete") || 
               occupation.toLowerCase().includes("trainer") ||
               occupation.toLowerCase().includes("fitness")) {
        clothing = "in athletic clothing including a proper shirt/top and athletic pants/shorts";
      }
      else if (occupation.toLowerCase().includes("artist") || 
               occupation.toLowerCase().includes("creative")) {
        clothing = "in casual but stylish clothing, fully dressed";
      }
      else if (occupation.toLowerCase().includes("farmer") || 
               occupation.toLowerCase().includes("rancher")) {
        clothing = "in practical work clothing, long-sleeved shirt and jeans";
      }
      else if (occupation.toLowerCase().includes("driver") || 
               occupation.toLowerCase().includes("trucker")) {
        clothing = "in casual but practical clothing, wearing a collared shirt";
      }
      else {
        // Default for other occupations
        clothing = "in appropriate professional clothing including a button-up shirt/blouse";
      }
    } else {
      // Generic clothing if no occupation is specified
      clothing = "dressed in proper casual attire including a shirt/top and pants/skirt";
    }
    
    // Build the base prompt - using "photograph" and emphasizing realism
    let imagePrompt = `A highly realistic photograph of a ${age}-year-old ${ethnicity} ${gender}`;
    
    // Add body type if specified
    if (bodyType) {
      imagePrompt += ` who is ${bodyType}`;
    }
    
    // Add occupation if available
    if (occupation) {
      imagePrompt += ` working as a ${occupation}`;
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
    
    // Add social characteristics
    if (socialDescription) {
      imagePrompt += `, ${socialDescription}`;
    }
    
    // Add specific instructions to ensure photorealistic, non-cartoonish representation WITH CLOTHING
    imagePrompt += `. IMPORTANT: Create a PHOTOREALISTIC portrait, absolutely not cartoonish or illustrated. Use photographic realism like a high-quality professional headshot or passport photo. The image must be completely realistic with proper lighting, skin texture, and natural facial features. Show the person with ${bodyType || "average"} body type in a natural pose, FULLY CLOTHED in appropriate attire for their profession or casual setting. THE PERSON MUST BE WEARING PROPER CLOTHING THAT COVERS THEIR TORSO AND BODY APPROPRIATELY.`;
    
    if (bodyType === "overweight") {
      imagePrompt += " The person should be genuinely overweight with visible weight in the face and body, but avoid any exaggeration or caricature.";
    }
    
    if (emotionalState) {
      imagePrompt += ` The facial expression should naturally show ${emotionalState.replace(/with a |looking /g, "")}.`;
    }
    
    if (healthConditions.length > 0) {
      imagePrompt += " Health conditions should be subtly visible in their appearance without exaggeration.";
    }

    // Add specifics about photo quality and style
    imagePrompt += " The photograph should look like it was taken with a professional camera with natural lighting, shallow depth of field, and realistic colors. Absolutely NO cartoon style, NO illustration style, NO exaggerated features, and NO NUDITY WHATSOEVER - ensure the person is appropriately dressed for their context.";
    
    console.log("Generated prompt:", imagePrompt);
    
    // Call the OpenAI Image Generation API with quality set to "hd" and updated parameters
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
        response_format: "url",
        quality: "hd",
        style: "natural" // Use natural style for more photorealistic results
      })
    });
    
    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${imageResponse.status}`);
    }
    
    const imageData = await imageResponse.json();
    
    if (!imageData.data || !imageData.data[0] || !imageData.data[0].url) {
      throw new Error("Invalid response from OpenAI image generation");
    }
    
    const imageUrl = imageData.data[0].url;
    console.log("Successfully generated image URL:", imageUrl);
    
    return new Response(
      JSON.stringify({
        success: true,
        image_url: imageUrl,
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
