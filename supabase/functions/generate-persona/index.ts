
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { personaTemplate } from "./personaTemplate.ts";
import { interviewSections } from "./interviewData.ts";
import { generatePersonaTraits, generateInterviewResponses } from "./openaiService.ts";
import { RequestData, PersonaResponse, InterviewSection } from "./types.ts";

// Check if OpenAI API key is configured
const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

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

    const requestData = await req.json().catch(() => ({} as RequestData));
    const { prompt, userId } = requestData;
    
    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      console.error("Valid prompt is required");
      throw new Error("Valid prompt is required");
    }

    console.log("Generating persona from prompt:", prompt);
    if (userId) {
      console.log("Creating for user:", userId);
    }

    // Step 1: Generate basic persona traits with enhanced trait architecture
    const personaTraits = await generatePersonaTraits(prompt, personaTemplate);
    
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

    // Step 2: Generate interview responses based on the persona
    const interviewResponsesResult = await generateInterviewResponses(personaTraits);
    
    // Update the persona with the interview responses if they were generated successfully
    if (interviewResponsesResult) {
      if (Array.isArray(interviewResponsesResult)) {
        // Response is directly the interview_sections array
        personaTraits.interview_sections = interviewResponsesResult;
      } else if (interviewResponsesResult.interview_sections && 
                Array.isArray(interviewResponsesResult.interview_sections)) {
        // Response has the interview_sections property
        personaTraits.interview_sections = interviewResponsesResult.interview_sections;
      } else {
        console.error("Unexpected format for interview responses:", interviewResponsesResult);
      }
      
      console.log("Updated persona with interview responses");
    }

    // Store the original prompt
    personaTraits.prompt = prompt;

    console.log("Returning generated persona");
    return new Response(
      JSON.stringify({
        success: true,
        persona: personaTraits
      } as PersonaResponse),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating persona:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to generate persona",
      } as PersonaResponse),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
