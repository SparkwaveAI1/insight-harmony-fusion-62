
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
        "diabetes": "diabetic",
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
        "depression": "looking depressed",
        "depressed": "looking depressed",
        "sad": "with a sad expression",
        "anxious": "with an anxious expression",
        "anxiety": "with an anxious expression",
        "tired": "looking tired and worn",
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
      socialDescription = "with an awkward, uncomfortable expression";
    }
    
    // Build the base prompt
    let imagePrompt = `A realistic photograph of a ${age}-year-old ${ethnicity} ${gender}`;
    
    // Add body type if specified
    if (bodyType) {
      imagePrompt += ` who is ${bodyType}`;
    }
    
    // Add occupation if available
    if (occupation) {
      imagePrompt += ` working as a ${occupation}`;
    }
    
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
    
    // Add specific instructions to ensure accurate representation
    imagePrompt += `. IMPORTANT: This must be a realistic portrait photo, NOT idealized or beautified. The image should accurately show the person with ${bodyType || "average"} body type, with realistic facial features that match their ${age} years and life circumstances. Do not make the person attractive, stylish, or well-groomed unless specifically mentioned in the description.`;
    
    if (bodyType === "overweight") {
      imagePrompt += " The person should be clearly and realistically overweight with visible weight in the face and neck.";
    }
    
    if (emotionalState) {
      imagePrompt += ` The facial expression must clearly show ${emotionalState.replace("looking ", "")}.`;
    }
    
    if (healthConditions.length > 0) {
      imagePrompt += " Health conditions should be visible in their appearance.";
    }
    
    console.log("Generated prompt:", imagePrompt);
    
    // Call the OpenAI Image Generation API
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
        quality: "hd"
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
