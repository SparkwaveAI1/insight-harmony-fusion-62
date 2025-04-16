
export async function generatePersonaTraits(prompt: string, openAIApiKey: string) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
            content: `You are an AI specialized in creating realistic personas for research. 
            Given a brief description, generate a detailed psychological profile following the template exactly.
            You should fill in all the demographic fields in the metadata section, and the psychological traits.
            Use realistic values based on demographic probability distributions.
            Maintain internal consistency while allowing for realistic contradictions.
            IMPORTANT: For the name field, ONLY use a first name followed by last initial (e.g., "Maria J.", "James T.") - never use full last names.
            CRITICAL: You must EXACTLY match the template structure. Do not add or remove any fields.
            Do not include any fields that are not in the template.
            Each section (metadata, trait_profile, etc.) must contain exactly the same structure as the template.
            Return valid JSON matching the template structure precisely.` 
          },
          { 
            role: "user", 
            content: `${prompt}
            
            Generate a realistic persona based on this description following the template structure exactly.
            The output should be valid JSON without any markdown formatting.`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error (${response.status}): ${errorText}`);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log("OpenAI API response received successfully");
    return responseData;
  } catch (error) {
    console.error("Error in generatePersonaTraits:", error);
    throw error;
  }
}

export async function generateInterviewResponses(persona: any, openAIApiKey: string) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
            Given a persona definition, generate plausible responses to the preset interview questions 
            that match the persona's characteristics, traits, and speaking style.
            Ensure responses reflect the persona's demographic information and psychological traits.
            Include behavioral inconsistencies where appropriate.
            For each question in each section, provide a response in the "response" field of each question object.
            Do not add any fields or properties that were not in the input template.` 
          },
          { 
            role: "user", 
            content: `Generate plausible interview responses for this persona:
            ${JSON.stringify(persona, null, 2)}
            
            For each question in each interview section, add a realistic response that this persona would give.
            Return the complete interview_sections array with the responses added as JSON, no markdown formatting.` 
          }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error (${response.status}): ${errorText}`);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log("Interview responses generated successfully");
    return responseData;
  } catch (error) {
    console.error("Error in generateInterviewResponses:", error);
    throw error;
  }
}
