
export async function generatePersonaTraits(prompt: string, openAIApiKey: string) {
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
          Return the output as valid JSON matching the provided template exactly.` 
        },
        { 
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  return response.json();
}

export async function generateInterviewResponses(persona: any, openAIApiKey: string) {
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
          For each question in each section, provide a response in the "response" field of each question object.` 
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
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  return response.json();
}

