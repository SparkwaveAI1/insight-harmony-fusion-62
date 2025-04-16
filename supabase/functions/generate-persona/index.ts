
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { personaTemplate } from "../_shared/personaTemplate.ts";
import { interviewSections } from "../_shared/interviewSections.ts";
import { generatePersonaTraits, generateInterviewResponses } from "../_shared/generatePersonaUtils.ts";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

// Helper function to sanitize and validate the persona object
function sanitizePersona(personaTraits: any, template: any): any {
  // Create a new object based on the template structure
  const sanitized: any = {};
  
  // Copy only the properties that exist in the template
  for (const key of Object.keys(template)) {
    if (key in personaTraits) {
      if (typeof template[key] === 'object' && template[key] !== null && typeof personaTraits[key] === 'object' && personaTraits[key] !== null) {
        sanitized[key] = sanitizePersona(personaTraits[key], template[key]);
      } else {
        sanitized[key] = personaTraits[key];
      }
    } else {
      sanitized[key] = template[key];
    }
  }
  
  return sanitized;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      console.error("OPENAI_API_KEY is not configured in environment variables");
      throw new Error("OPENAI_API_KEY is not configured in environment variables");
    }

    const requestData = await req.json().catch(() => ({}));
    const { prompt } = requestData;
    
    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      console.error("Valid prompt is required");
      throw new Error("Valid prompt is required");
    }

    console.log("Generating persona from prompt:", prompt);

    // Step 1: Generate basic persona traits
    const traitsResponse = await generatePersonaTraits(prompt, openAIApiKey);
    
    if (!traitsResponse.choices || !traitsResponse.choices[0] || !traitsResponse.choices[0].message) {
      console.error("Invalid response from OpenAI:", traitsResponse);
      throw new Error("Invalid response from OpenAI");
    }
    
    let personaTraits;
    try {
      const content = traitsResponse.choices[0].message.content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonContent = jsonMatch ? jsonMatch[1] : content;
      
      personaTraits = JSON.parse(jsonContent);
      console.log("Successfully parsed persona traits");
      
      // Sanitize the persona to ensure it matches the template structure
      personaTraits = sanitizePersona(personaTraits, personaTemplate);
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      throw new Error("Failed to parse persona data from OpenAI response");
    }
    
    // Add creation date and unique ID
    personaTraits.creation_date = new Date().toISOString().split('T')[0];
    personaTraits.persona_id = crypto.randomUUID().substring(0, 8);
    
    // Add interview sections with placeholder for responses
    const interviewSectionsWithEmptyResponses = interviewSections.map(section => ({
      ...section,
      questions: section.questions.map(question => ({
        question,
        response: "" // Empty response placeholder
      }))
    }));
    
    personaTraits.interview_sections = interviewSectionsWithEmptyResponses;

    // Step 2: Generate interview responses
    const interviewData = await generateInterviewResponses(personaTraits, openAIApiKey);
    
    try {
      const content = interviewData.choices[0].message.content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonContent = jsonMatch ? jsonMatch[1] : content;
      
      const parsedResponse = JSON.parse(jsonContent);
      console.log("Successfully parsed interview responses");
      
      if (Array.isArray(parsedResponse)) {
        personaTraits.interview_sections = parsedResponse;
      } else if (parsedResponse.interview_sections && Array.isArray(parsedResponse.interview_sections)) {
        personaTraits.interview_sections = parsedResponse.interview_sections;
      } else {
        console.error("Unexpected format for interview responses:", parsedResponse);
      }
    } catch (e) {
      console.error("Error parsing interview responses:", e);
    }

    // Before returning the persona, ensure the name format is correct
    if (personaTraits.name && personaTraits.name.split(' ').length > 2) {
      const nameParts = personaTraits.name.split(' ');
      personaTraits.name = `${nameParts[0]} ${nameParts[nameParts.length - 1].charAt(0)}.`;
    }

    console.log("Returning generated persona");
    return new Response(
      JSON.stringify({
        success: true,
        persona: personaTraits
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating persona:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to generate persona",
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
