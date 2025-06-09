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
    const socialClass = metadata.social_class_identity || "";
    const region = metadata.region || "";
    const urbanRural = metadata.urban_rural_context || "";
    
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
    
    // Enhanced clothing selection based on multiple factors
    function getPersonaClothing(occupation, gender, age, socialClass, region, urbanRural, description) {
      const ageNum = typeof age === 'string' ? parseInt(age) : age;
      const isUrban = urbanRural?.toLowerCase().includes('urban');
      const isFemale = gender?.toLowerCase() === 'female' || gender?.toLowerCase().includes('woman');
      
      // Check for specific clothing mentions in description
      let specificClothing = "";
      if (description) {
        const clothingKeywords = {
          "casual": "casual",
          "formal": "formal business",
          "creative": "creative and artistic",
          "bohemian": "bohemian style",
          "trendy": "trendy and fashionable",
          "conservative": "conservative and traditional",
          "athletic": "athletic and sporty",
          "vintage": "vintage-inspired",
          "minimalist": "clean and minimalist"
        };
        
        Object.entries(clothingKeywords).forEach(([keyword, style]) => {
          if (description.toLowerCase().includes(keyword)) {
            specificClothing = style;
          }
        });
      }
      
      // Professional occupation-based clothing
      if (occupation) {
        const occupationLower = occupation.toLowerCase();
        
        // Medical professionals
        if (occupationLower.includes("doctor") || occupationLower.includes("physician") || 
            occupationLower.includes("surgeon") || occupationLower.includes("nurse")) {
          return isFemale ? 
            "wearing professional medical attire - a white coat over a blouse or scrubs with a professional appearance" :
            "wearing professional medical attire - a white coat over a dress shirt or medical scrubs";
        }
        
        // Legal professionals
        if (occupationLower.includes("lawyer") || occupationLower.includes("attorney") || 
            occupationLower.includes("judge")) {
          return isFemale ?
            "wearing a sophisticated business suit or blazer with a blouse, professional and authoritative" :
            "wearing a formal business suit with tie, professional and authoritative";
        }
        
        // Corporate/Business
        if (occupationLower.includes("executive") || occupationLower.includes("manager") || 
            occupationLower.includes("consultant") || occupationLower.includes("finance") ||
            occupationLower.includes("analyst")) {
          return isFemale ?
            "wearing modern business attire - a tailored blazer or professional dress" :
            "wearing business formal attire - a suit or dress shirt with slacks";
        }
        
        // Education
        if (occupationLower.includes("teacher") || occupationLower.includes("professor") || 
            occupationLower.includes("educator")) {
          return isFemale ?
            "wearing professional casual attire - a cardigan or blouse with modest jewelry" :
            "wearing smart casual attire - a collared shirt or sweater, approachable and professional";
        }
        
        // Creative fields
        if (occupationLower.includes("artist") || occupationLower.includes("designer") || 
            occupationLower.includes("writer") || occupationLower.includes("photographer") ||
            occupationLower.includes("creative")) {
          return isFemale ?
            "wearing creative and expressive clothing - an artistic blouse or unique accessories that reflect creativity" :
            "wearing creative casual attire - an interesting shirt or jacket that shows artistic sensibility";
        }
        
        // Tech/Engineering
        if (occupationLower.includes("engineer") || occupationLower.includes("developer") || 
            occupationLower.includes("programmer") || occupationLower.includes("tech")) {
          return isFemale ?
            "wearing modern casual attire - a comfortable blouse or sweater, practical yet stylish" :
            "wearing tech casual - a polo shirt or casual button-down, comfortable and modern";
        }
        
        // Service industry
        if (occupationLower.includes("retail") || occupationLower.includes("customer service") || 
            occupationLower.includes("hospitality")) {
          return isFemale ?
            "wearing neat casual attire - a clean blouse or uniform-appropriate top" :
            "wearing service industry attire - a polo shirt or clean casual shirt";
        }
        
        // Trades/Manual labor
        if (occupationLower.includes("construction") || occupationLower.includes("mechanic") || 
            occupationLower.includes("electrician") || occupationLower.includes("plumber")) {
          return isFemale ?
            "wearing practical work attire - a durable shirt or uniform appropriate for manual work" :
            "wearing work attire - a sturdy shirt or work uniform, practical and durable";
        }
        
        // Healthcare support
        if (occupationLower.includes("therapist") || occupationLower.includes("counselor") || 
            occupationLower.includes("social worker")) {
          return isFemale ?
            "wearing approachable professional attire - a soft blouse or cardigan, warm and trustworthy" :
            "wearing approachable casual attire - a sweater or casual shirt, warm and professional";
        }
        
        // Food service
        if (occupationLower.includes("chef") || occupationLower.includes("cook") || 
            occupationLower.includes("restaurant")) {
          return isFemale ?
            "wearing culinary attire - chef's coat or restaurant uniform adapted for women" :
            "wearing chef attire - a chef's coat or professional kitchen uniform";
        }
        
        // Law enforcement/Security
        if (occupationLower.includes("police") || occupationLower.includes("officer") ||
            occupationLower.includes("security") || occupationLower.includes("detective")) {
          return isFemale ?
            "wearing professional uniform or business attire appropriate for law enforcement" :
            "wearing professional uniform or business attire appropriate for law enforcement";
        }
      }
      
      // Age-based defaults if no specific occupation
      if (ageNum && ageNum < 25) {
        return isFemale ?
          "wearing trendy young adult clothing - a stylish top that reflects current fashion" :
          "wearing modern young adult attire - a contemporary shirt or sweater";
      } else if (ageNum && ageNum > 60) {
        return isFemale ?
          "wearing classic mature attire - an elegant blouse or cardigan, timeless and refined" :
          "wearing distinguished mature attire - a quality shirt or sweater, classic and refined";
      }
      
      // Social class considerations
      if (socialClass) {
        const classLower = socialClass.toLowerCase();
        if (classLower.includes("upper") || classLower.includes("wealthy")) {
          return isFemale ?
            "wearing upscale attire - a high-quality blouse or designer top, sophisticated and well-tailored" :
            "wearing upscale attire - a quality dress shirt or fine sweater, sophisticated and well-made";
        } else if (classLower.includes("working")) {
          return isFemale ?
            "wearing practical everyday attire - a comfortable and modest blouse or shirt" :
            "wearing practical everyday attire - a comfortable shirt or casual wear";
        }
      }
      
      // Regional considerations
      if (region) {
        const regionLower = region.toLowerCase();
        if (regionLower.includes("south")) {
          return isFemale ?
            "wearing Southern-appropriate attire - a nice blouse or top suitable for warm weather" :
            "wearing Southern-appropriate attire - a collared shirt suitable for warm climate";
        } else if (regionLower.includes("north") || regionLower.includes("midwest")) {
          return isFemale ?
            "wearing weather-appropriate attire - a blouse or sweater suitable for variable weather" :
            "wearing weather-appropriate attire - a shirt or sweater suitable for cooler climate";
        }
      }
      
      // Use specific clothing style if mentioned in description
      if (specificClothing) {
        return isFemale ?
          `wearing ${specificClothing} attire - clothing that reflects this aesthetic in women's fashion` :
          `wearing ${specificClothing} attire - clothing that reflects this aesthetic in men's fashion`;
      }
      
      // Default general clothing
      return isFemale ?
        "wearing casual professional attire - a nice blouse or top, approachable and well-dressed" :
        "wearing casual professional attire - a collared shirt or sweater, approachable and well-dressed";
    }
    
    const clothing = getPersonaClothing(occupation, gender, age, socialClass, region, urbanRural, description);
    
    // Build the base prompt - using photo-realistic specifications
    let imagePrompt = `A photo-realistic portrait of a ${age}-year-old ${ethnicity} ${gender}`;
    
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
    
    // Add photo-realistic specifications
    imagePrompt += `. A photo-realistic portrait, shot with a DSLR camera, natural lighting, ultra-detailed skin texture, shallow depth of field, clean background, 35mm lens, no artistic filters, no drawing or painting effects. This is not an illustration or 3D render — it is a real photograph. Professional headshot style with proper studio lighting, realistic skin texture, and natural facial features. The photo should be well-composed with the subject's face being the main focus, with shoulders visible.`;
    
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
