
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
    const physicalDescription = metadata.physical_description || "";
    
    // Physical attributes that should be extracted from the description
    let isOverweight = false;
    let healthConditions = [];
    
    // Parse the original description for physical attributes and health conditions
    if (description) {
      if (description.toLowerCase().includes("overweight") || 
          description.toLowerCase().includes("obese") || 
          description.toLowerCase().includes("heavy")) {
        isOverweight = true;
      }
      
      // Check for common health conditions
      const conditions = ["diabetic", "diabetes", "asthma", "high blood pressure", "hypertension"];
      conditions.forEach(condition => {
        if (description.toLowerCase().includes(condition)) {
          healthConditions.push(condition);
        }
      });
    }
    
    // Mental health aspects
    let mentalHealthTraits = [];
    if (description.toLowerCase().includes("depression") || 
        description.toLowerCase().includes("depressed")) {
      mentalHealthTraits.push("showing signs of depression");
    }
    if (description.toLowerCase().includes("anxious") || 
        description.toLowerCase().includes("anxiety")) {
      mentalHealthTraits.push("appears anxious");
    }
    if (description.toLowerCase().includes("tired") || 
        description.toLowerCase().includes("exhausted")) {
      mentalHealthTraits.push("looks tired");
    }
    
    // Social aspects that might be visible
    let socialTraits = [];
    if (description.toLowerCase().includes("trouble socially") || 
        description.toLowerCase().includes("not many friends") || 
        description.toLowerCase().includes("lonely")) {
      socialTraits.push("appears somewhat uncomfortable or awkward");
    }
    
    // Start building the prompt
    let imagePrompt = `A realistic photograph of a ${age}-year-old ${ethnicity} ${gender}`;
    
    // Add physical description
    if (isOverweight) {
      imagePrompt += " who is overweight";
    } else if (physicalDescription) {
      imagePrompt += ` who is ${physicalDescription}`;
    }
    
    // Add occupation
    if (occupation) {
      imagePrompt += ` who works as a ${occupation}`;
    }
    
    // Add health conditions if present
    if (healthConditions.length > 0) {
      imagePrompt += ` and has ${healthConditions.join(" and ")}`;
    }
    
    // Add mental health and social traits
    if (mentalHealthTraits.length > 0) {
      imagePrompt += `. This person ${mentalHealthTraits.join(" and ")}`;
    }
    
    if (socialTraits.length > 0) {
      imagePrompt += ` and ${socialTraits.join(" and ")}`;
    }
    
    // Add specific instructions for professional headshot style
    imagePrompt += `. IMPORTANT: This must be a realistic headshot portrait with a plain background. The image should be framed from shoulders up, with natural lighting. This should be a CANDID REALISTIC photo, NOT idealized or beautified - show the actual physical traits described including weight, health conditions, and emotional state. Make sure the image honestly depicts the person described with all their physical characteristics.`;
    
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
