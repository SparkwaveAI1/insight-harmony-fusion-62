import { OpenAIService } from '@/services/ai/openaiService';
import { toast } from 'sonner';

/**
 * Converts legacy persona JSON data into a natural, detailed description
 * @param legacyPersonaJSON - The persona JSON object to convert
 * @returns Promise<string> - Natural language description of the persona
 */
export async function convertPersonaToDescription(legacyPersonaJSON: any): Promise<string> {
  try {
    console.log('Converting persona JSON to description...');

    // Handle missing/null fields gracefully by filtering out undefined/null values
    const cleanedPersona = JSON.parse(JSON.stringify(legacyPersonaJSON, (key, value) => {
      if (value === null || value === undefined) {
        return '[not specified]';
      }
      return value;
    }));

    const prompt = `Convert this persona JSON data into a natural, detailed description of a person. Include their appearance, background, personality, health status, and life circumstances. Write it as if describing a real person:

${JSON.stringify(cleanedPersona, null, 2)}

Create a flowing narrative description that captures all the key details.`;

    const description = await OpenAIService.generateCompletion(prompt, {
      model: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 1500
    });

    if (!description || description.trim().length === 0) {
      throw new Error('Generated description is empty');
    }

    console.log('Successfully converted persona to description');
    return description.trim();

  } catch (error) {
    console.error('Error converting persona to description:', error);
    toast.error('Failed to convert persona to description');
    throw error;
  }
}