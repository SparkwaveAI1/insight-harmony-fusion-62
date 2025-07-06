
import { PersonaTemplate } from "./types.ts";
import { generateChatResponse } from "../_shared/openai.ts";

export async function generatePersonaDescription(persona: PersonaTemplate): Promise<string> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('OpenAI API key not found');
  }

  const prompt = `Create a compelling, concise description (under 300 words) for this persona. Write it as a flowing paragraph that captures their essence, personality, and key characteristics. Make it engaging and human-like.

PERSONA DATA:
Name: ${persona.name}
Demographics: ${JSON.stringify(persona.metadata, null, 2)}
Personality Traits: ${JSON.stringify(persona.trait_profile, null, 2)}
Emotional Triggers: ${JSON.stringify(persona.emotional_triggers, null, 2)}

Write a natural, engaging description that brings this person to life. Focus on:
- Their core personality and values
- Key life circumstances and background
- What drives and motivates them
- How they interact with the world
- What makes them unique

Keep it under 300 words and write in third person as a flowing narrative paragraph.`;

  try {
    const response = await generateChatResponse(
      [
        {
          role: "system",
          content: "You are an expert at creating compelling, concise persona descriptions. Write engaging, human-centered descriptions that bring personas to life."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      apiKey,
      {
        model: 'gpt-4.1-2025-04-14',
        temperature: 0.7,
        max_tokens: 400
      }
    );

    const description = response.choices[0]?.message?.content?.trim();
    
    if (!description) {
      throw new Error('Failed to generate persona description');
    }

    // Ensure it's under 300 words
    const wordCount = description.split(/\s+/).length;
    if (wordCount > 300) {
      console.warn(`Generated description is ${wordCount} words, truncating to 300 words`);
      const words = description.split(/\s+/).slice(0, 300);
      return words.join(' ') + '...';
    }

    return description;
  } catch (error) {
    console.error('Error generating persona description:', error);
    throw error;
  }
}
