
import { PersonaTemplate, PersonaResponse } from "./types.ts";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export async function generatePersonaTraits(prompt: string, template: PersonaTemplate): Promise<PersonaTemplate> {
  const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
  
  if (!openAIApiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  const systemPrompt = `You are an expert persona generator that creates realistic, psychologically consistent human personas. 

CRITICAL INSTRUCTIONS:
1. Generate a comprehensive persona based on the user prompt
2. Ensure ALL health-related attributes are consistent with the persona's age, lifestyle, occupation, and life experiences
3. Physical description must be realistic and coherent with demographic and cultural background
4. Health conditions, medications, and fitness levels should align with age, stress levels, occupation, and lifestyle choices
5. Mental health history should be consistent with trauma exposure, stress levels, and life circumstances
6. Knowledge domains should reflect education, occupation, interests, and life experiences
7. All traits must be interconnected and psychologically realistic

ENHANCED HEALTH ATTRIBUTES - Pay special attention to consistency:
- Physical and mental health status should reflect age, lifestyle, occupation stress
- Chronic conditions should be age-appropriate and consistent with family history
- Medications should match any chronic conditions mentioned
- Fitness level should align with lifestyle, occupation, and health prioritization
- Sleep patterns and stress management should reflect occupation and life circumstances
- Substance use should be realistic for demographic and cultural background

PHYSICAL DESCRIPTION - Must be realistic and consistent:
- Height, build, and physical features should reflect genetic background and lifestyle
- Style and grooming should match social class, occupation, and cultural background
- Physical mannerisms should reflect personality traits and cultural background
- Voice patterns should align with education, region, and cultural background

Generate a JSON response with all required fields filled. Use realistic values that create a coherent, believable person.`;

  const userPrompt = `Create a detailed persona based on this description: "${prompt}"

Requirements:
- Fill ALL metadata fields with realistic, consistent values
- Ensure health attributes reflect the persona's life circumstances
- Make physical description coherent with demographic background
- Rate knowledge domains (1-5 scale) based on education and interests
- Ensure all traits interconnect logically
- Generate 3-5 distinctive features for physical description
- Include 2-4 physical mannerisms that reflect personality
- Provide specific details rather than generic responses`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Unexpected OpenAI response structure:", data);
      throw new Error("Invalid OpenAI response structure");
    }

    const content = data.choices[0].message.content;
    
    try {
      const personaData = JSON.parse(content);
      
      // Merge with template to ensure all fields are present
      const mergedPersona = {
        ...template,
        ...personaData,
        metadata: {
          ...template.metadata,
          ...personaData.metadata,
          // Ensure enhanced metadata version is set
          enhanced_metadata_version: 2,
        },
        trait_profile: {
          ...template.trait_profile,
          ...personaData.trait_profile,
        },
      };

      console.log("Generated persona with enhanced health and physical attributes");
      return mergedPersona;
    } catch (parseError) {
      console.error("Error parsing OpenAI JSON response:", parseError);
      console.error("Raw content:", content);
      throw new Error("Failed to parse OpenAI JSON response");
    }
  } catch (error) {
    console.error("Error in generatePersonaTraits:", error);
    throw error;
  }
}

export async function generateInterviewResponses(persona: PersonaTemplate): Promise<any> {
  const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
  
  if (!openAIApiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  const systemPrompt = `You are roleplaying as the persona described below. Answer the interview questions naturally, authentically, and consistently with your persona's traits, health status, physical characteristics, and life experiences.

PERSONA CONTEXT:
- Demographics: ${JSON.stringify(persona.metadata, null, 2)}
- Traits: ${JSON.stringify(persona.trait_profile, null, 2)}
- Health & Physical: Pay special attention to health conditions, fitness level, physical appearance, and how these affect daily life and responses

Answer each question as this person would, incorporating:
- Your health status and how it impacts your life
- Your physical characteristics and how you present yourself
- Your knowledge domains and expertise levels
- Your personality traits and behavioral patterns
- Your cultural background and life experiences

Be authentic, detailed, and consistent across all responses.`;

  const questions = persona.interview_sections.flatMap(section => 
    section.questions.map(q => q.question)
  );

  const userPrompt = `Answer these interview questions as the persona:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Return a JSON object with "responses" array containing your answers in order.`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.9,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error for interview responses:", response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const responseData = JSON.parse(content);

    // Map responses back to interview sections
    const updatedSections = persona.interview_sections.map(section => ({
      ...section,
      questions: section.questions.map((q, qIndex) => {
        const globalIndex = persona.interview_sections
          .slice(0, persona.interview_sections.indexOf(section))
          .reduce((acc, s) => acc + s.questions.length, 0) + qIndex;
        
        return {
          ...q,
          response: responseData.responses[globalIndex] || ""
        };
      })
    }));

    console.log("Generated interview responses with health and physical context");
    return updatedSections;
  } catch (error) {
    console.error("Error generating interview responses:", error);
    return null;
  }
}
