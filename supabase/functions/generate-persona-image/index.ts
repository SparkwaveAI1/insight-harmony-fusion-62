
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
    const extendedTraits = traits.extended_traits || {};
    
    // Extract essential data
    const age = metadata.age || "adult";
    const gender = metadata.gender || "person";
    const ethnicity = metadata.race_ethnicity || "";
    const occupation = metadata.occupation || "";
    
    // Extract additional details if available
    const region = metadata.region || "";
    const styleKeywords = [];
    
    // Personality-based style hints
    if (traits.big_five) {
      const bigFive = traits.big_five;
      if (bigFive.openness && parseFloat(bigFive.openness) > 0.6) styleKeywords.push("creative");
      if (bigFive.conscientiousness && parseFloat(bigFive.conscientiousness) > 0.6) styleKeywords.push("organized");
      if (bigFive.extraversion && parseFloat(bigFive.extraversion) > 0.6) styleKeywords.push("outgoing");
      if (bigFive.agreeableness && parseFloat(bigFive.agreeableness) > 0.6) styleKeywords.push("friendly");
      if (bigFive.neuroticism && parseFloat(bigFive.neuroticism) > 0.6) styleKeywords.push("pensive");
    }
    
    // Construct the prompt with strict emphasis on headshot with plain background
    let imagePrompt = `A professional headshot portrait photograph of a ${age}-year-old ${ethnicity} ${gender}`;
    
    if (occupation) {
      imagePrompt += ` who works as a ${occupation}`;
    }
    
    if (styleKeywords.length > 0) {
      imagePrompt += `. Their appearance is ${styleKeywords.slice(0, 2).join(", ")}`;
    }
    
    // Add specific instructions for professional headshot style
    imagePrompt += `. IMPORTANT: This must be ONLY a professional headshot portrait with a completely solid plain background (white, light gray, or neutral color). The image should be framed from shoulders up, showing just the person's head and shoulders against a plain backdrop. The lighting should be even and professional, similar to a LinkedIn profile photo or corporate ID. Do not include any props, scenes, landscapes, cityscapes, objects, text, logos, or other people in the image. The background must be completely plain and uniform with no patterns, textures, or gradients.`;
    
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
