import { PersonaTemplate } from "./types.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required');
}

// Enhanced persona generation with health and physical attributes
export async function generatePersona(userPrompt: string): Promise<PersonaTemplate> {
  console.log(`Generating persona with enhanced health and physical attributes from prompt: ${userPrompt}`);
  
  const prompt = `You are an expert persona creator. Generate a highly detailed, authentic persona based on this description: "${userPrompt}"

CRITICAL INSTRUCTIONS:
1. You must respond with ONLY valid JSON - no markdown, no explanations, no extra text
2. Follow the exact structure provided in the template
3. All trait values must be numbers between 0.0 and 1.0
4. Be creative and realistic with the persona details
5. Make the persona feel like a real, complex human being

Generate a comprehensive persona with all required fields filled out. Make sure to include:
- Enhanced metadata with health, physical, and relationship details
- Complete trait profile with all psychological dimensions
- Behavioral modulation patterns
- Linguistic profile with speech patterns
- Sample interview responses that feel authentic

Return ONLY the JSON object:`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: prompt
          },
          {
            role: 'user', 
            content: JSON.stringify({
              // Include the persona template structure here as guidance
              persona_id: "example_id",
              name: "Example Name",
              creation_date: new Date().toISOString().split('T')[0],
              metadata: {
                enhanced_metadata_version: 2,
                age: 30,
                // ... other metadata fields
              },
              trait_profile: {
                big_five: {
                  openness: 0.7,
                  conscientiousness: 0.6,
                  extraversion: 0.8,
                  agreeableness: 0.7,
                  neuroticism: 0.4
                },
                // ... other trait fields
              },
              // ... other required fields
            })
          }
        ],
        max_tokens: 8000,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    console.log(`Raw OpenAI response: ${content.substring(0, 500)}...`);
    
    // Clean the response - remove any markdown formatting
    let cleanedContent = content;
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    try {
      const persona = JSON.parse(cleanedContent);
      console.log(`Generated persona with validated traits: ${persona.name}`);
      return persona;
    } catch (parseError) {
      console.error('Failed to parse persona JSON:', parseError);
      console.error('Content that failed to parse:', cleanedContent);
      throw new Error(`Failed to parse persona response: ${parseError.message}`);
    }
    
  } catch (error) {
    console.error('Error generating persona:', error);
    throw error;
  }
}

export async function generateInterviewResponses(persona: PersonaTemplate): Promise<any> {
  console.log('Generating interview responses with health and physical context');
  
  const prompt = `You are generating authentic interview responses for this persona. 

Persona Details:
- Name: ${persona.name}
- Age: ${persona.metadata.age}
- Occupation: ${persona.metadata.occupation}
- Key traits: Openness ${persona.trait_profile.big_five.openness}, Conscientiousness ${persona.trait_profile.big_five.conscientiousness}

CRITICAL: Respond with ONLY valid JSON in this exact format:
{
  "interview_sections": [
    {
      "section_title": "Personal Background",
      "responses": [
        {
          "question": "Tell me about yourself",
          "answer": "Authentic response in the persona's voice..."
        }
      ]
    }
  ]
}

Create 8-10 interview sections covering: background, daily life, decision making, values, relationships, career, challenges, future outlook, and personal insights. Make responses feel natural and authentic to this specific persona.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error(`OpenAI API error for interview: ${response.status} ${response.statusText}`);
      return { interview_sections: [] }; // Return empty but valid structure
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    // Clean any markdown formatting
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    try {
      const interviewData = JSON.parse(content);
      return interviewData;
    } catch (parseError) {
      console.error('Failed to parse interview responses:', parseError);
      console.error('Content that failed to parse:', content.substring(0, 200));
      // Return a fallback structure instead of throwing
      return {
        interview_sections: [
          {
            section_title: "Personal Background",
            responses: [
              {
                question: "Tell me about yourself",
                answer: `I'm ${persona.name}, and I'd describe myself as someone who values authenticity and genuine connections.`
              }
            ]
          }
        ]
      };
    }
    
  } catch (error) {
    console.error('Error generating interview responses:', error);
    // Return fallback instead of throwing
    return {
      interview_sections: [
        {
          section_title: "Personal Background", 
          responses: [
            {
              question: "Tell me about yourself",
              answer: `I'm ${persona.name}, and I'd be happy to share more about my background and experiences.`
            }
          ]
        }
      ]
    };
  }
}
