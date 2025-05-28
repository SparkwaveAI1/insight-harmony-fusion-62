
import { PersonaTemplate } from "./types.ts";
import { generateEmotionalTriggers } from "./emotionalTriggerGenerator.ts";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

// Generate the initial persona traits with enhanced trait architecture
export async function generatePersonaTraits(prompt: string, personaTemplate: PersonaTemplate): Promise<any> {
  console.log("Generating persona traits from prompt:", prompt);
  
  // Check if the prompt contains customization instructions and extract them
  const hasCustomizationInstructions = prompt.includes("IMPORTANT CUSTOMIZATION INSTRUCTIONS:");
  let customizationContent = "";
  
  if (hasCustomizationInstructions) {
    // Extract the customization instructions for special emphasis to the AI
    const customizationMatch = prompt.match(/IMPORTANT CUSTOMIZATION INSTRUCTIONS:\s*([\s\S]+?)(?=\n\nPlease create|$)/);
    if (customizationMatch && customizationMatch[1]) {
      customizationContent = customizationMatch[1].trim();
      console.log("Detected customization instructions:", customizationContent);
    }
  }
  
  // Create system instructions with emphasis on customizations if present
  let systemInstruction = `You are an AI specialized in creating realistic personas for research. 
    Given a brief description, generate a detailed psychological and demographic profile following the template exactly.
    
    Pay special attention to the comprehensive trait architecture:
    1. Base Traits (OCEAN, Moral Foundations, World Values, Political Compass, Behavioral Economics)
    2. Extended Traits (truth orientation, moral consistency, self-awareness, etc.)
    3. Dynamic State Modifiers (stress level, emotional stability context, etc.)
    
    IMPORTANT DIVERSITY GUIDELINES:
    - AVOID DEFAULT TRAITS: Do not use "coffee drinker" or other generic habits as default traits
    - CREATE UNIQUE ROUTINES: Each persona should have distinct daily patterns based on their specific background
    - VARY MORNING RITUALS: Some may drink coffee, others tea, water, nothing, protein shakes, etc.
    - DIVERSE PREFERENCES: Deliberately vary food preferences, media consumption, and daily habits
    - CULTURAL SPECIFICITY: Align habits with the persona's cultural background and region
    - SOCIOECONOMIC REALISM: Consider how income level would affect daily routines and consumption
    
    Fill in all demographic fields and knowledge domains in the metadata section.
    For each knowledge domain, assign a value from 1 (minimal) to 5 (expert).
    
    For trait values, use decimal values between 0 and 1 (like 0.7) or descriptive labels 
    that make psychological sense based on the persona.
    
    Maintain internal consistency while allowing for realistic contradictions.
    Return the output as valid JSON matching the provided template exactly.`;

  // If customization instructions are present, add them to the system instructions
  if (customizationContent) {
    systemInstruction += `\n\nCRITICAL CUSTOMIZATION REQUIRED: These customizations must be deeply integrated into the persona's traits and personality:
    ${customizationContent}
    
    The customization instructions should significantly influence ALL aspects of the persona, including their trait values, preferences, behaviors, and knowledge domains.`;
  }
  
  const traitsResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openAIApiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: systemInstruction
        },
        { 
          role: "user", 
          content: `Create a realistic persona based on this description: "${
            // Clean up the prompt if it contains the customization markers
            hasCustomizationInstructions ? 
              prompt.replace(/IMPORTANT CUSTOMIZATION INSTRUCTIONS:[\s\S]+?(?=\n\nPlease create|$)/, "").trim() : 
              prompt
          }".
          Fill in all the values according to the template structure below. Return ONLY the JSON data, no markdown formatting.
          ${JSON.stringify(personaTemplate, null, 2)}` 
        }
      ],
      temperature: 0.9, // Increased from 0.7 to encourage more diversity
    }),
  });

  if (!traitsResponse.ok) {
    const errorData = await traitsResponse.text();
    console.error("OpenAI API error:", errorData);
    throw new Error(`OpenAI API error: ${traitsResponse.status}`);
  }

  const traitsData = await traitsResponse.json();
  
  if (!traitsData.choices || !traitsData.choices[0] || !traitsData.choices[0].message) {
    console.error("Invalid response from OpenAI:", traitsData);
    throw new Error("Invalid response from OpenAI");
  }
  
  let personaTraits;
  try {
    const content = traitsData.choices[0].message.content;
    // Try to extract JSON if wrapped in markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const jsonContent = jsonMatch ? jsonMatch[1] : content;
    
    personaTraits = JSON.parse(jsonContent);
    console.log("Successfully parsed persona traits");
    
    // Generate emotional triggers based on the persona traits and original prompt
    console.log("Generating emotional triggers...");
    const emotionalTriggers = generateEmotionalTriggers(personaTraits, prompt);
    personaTraits.emotional_triggers = emotionalTriggers;
    console.log("Generated emotional triggers:", emotionalTriggers);
    
    // If customization was requested, store it in the persona metadata
    if (customizationContent && personaTraits.metadata) {
      personaTraits.metadata.customization_instructions = customizationContent;
      personaTraits.metadata.was_customized = true;
    }
  } catch (error) {
    console.error("Error parsing OpenAI response:", error);
    console.error("Raw content:", traitsData.choices[0].message.content);
    throw new Error("Failed to parse persona data from OpenAI response");
  }

  return personaTraits;
}

// Generate interview responses based on the persona
export async function generateInterviewResponses(personaTraits: any): Promise<any> {
  console.log("Generating interview responses for persona");
  
  const interviewResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openAIApiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `You are an AI that simulates interviews for realistic personas. 
          Given a persona definition with a comprehensive trait architecture including:
          1. Base Traits (OCEAN, Moral Foundations, World Values, Political Compass, Behavioral Economics)
          2. Extended Traits (truth orientation, moral consistency, self-awareness, etc.)
          3. Dynamic State Modifiers (stress level, emotional stability context, etc.)
          
          IMPORTANT DIVERSITY GUIDELINES FOR INTERVIEW RESPONSES:
          - AVOID GENERIC DEFAULTS: Do not default to common habits like "drinking coffee in the morning"
          - UNIQUE MORNING ROUTINES: Create specific, individualized morning routines that fit the persona
          - VARIED CONSUMPTION: Some personas may dislike coffee, prefer tea, or have other beverages
          - CULTURAL SPECIFICITY: Reflect cultural background in daily routine descriptions
          - OCCUPATION IMPACT: Consider how their job affects their daily schedule and habits
          - SOCIOECONOMIC REALISM: Reflect how income level would affect lifestyle choices
          - HEALTH FACTORS: Consider dietary restrictions, preferences, or health consciousness
          - REGIONAL DIFFERENCES: Account for regional differences in daily habits and preferences
          
          Generate plausible responses to the preset interview questions 
          that match the persona's characteristics, traits, and speaking style.
          Ensure responses reflect the persona's demographic information, psychological traits, and knowledge domains.
          Include behavioral inconsistencies where appropriate based on their trait profile.
          For each question in each section, provide a response in the "response" field of each question object.` 
        },
        { 
          role: "user", 
          content: `Generate plausible interview responses for this persona:
          ${JSON.stringify(personaTraits, null, 2)}
          
          For each question in each interview section, add a realistic response that this persona would give.
          Return the complete interview_sections array with the responses added as JSON, no markdown formatting.` 
        }
      ],
      temperature: 0.9, // Increased from 0.8 to encourage more diversity
    }),
  });

  if (!interviewResponse.ok) {
    const errorData = await interviewResponse.text();
    console.error("OpenAI API error (interview):", errorData);
    throw new Error(`OpenAI API error: ${interviewResponse.status}`);
  }

  const interviewData = await interviewResponse.json();
  
  try {
    const content = interviewData.choices[0].message.content;
    // Try to extract JSON if wrapped in markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const jsonContent = jsonMatch ? jsonMatch[1] : content;
    
    const parsedResponse = JSON.parse(jsonContent);
    console.log("Successfully parsed interview responses");
    
    return parsedResponse;
  } catch (e) {
    console.error("Error parsing interview responses:", e);
    console.error("Raw content:", interviewData.choices[0].message.content);
    // Return null if parsing fails
    return null;
  }
}
