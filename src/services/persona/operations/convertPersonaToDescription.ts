import { OpenAIService } from '@/services/ai/openaiService';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { listPersonaCollections } from '@/lib/api/memories';

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

    // Get persona collections to preserve them in the description
    let collectionsText = '';
    if (legacyPersonaJSON.persona_id) {
      try {
        console.log('Fetching collections for persona:', legacyPersonaJSON.persona_id);
        const collectionsResult = await listPersonaCollections(supabase, legacyPersonaJSON.persona_id);
        
        if (collectionsResult.data && collectionsResult.data.length > 0) {
          const collectionNames = collectionsResult.data.map(collection => collection.name);
          collectionsText = `\n\nCollections: ${collectionNames.join(', ')}`;
          console.log('Found collections for persona:', collectionNames);
        }
      } catch (error) {
        console.warn('Could not fetch collections for persona:', error);
        // Continue without collections if there's an error
      }
    }

    const finalDescription = description.trim() + collectionsText;
    console.log('Successfully converted persona to description with collections');
    return finalDescription;

  } catch (error) {
    console.error('Error converting persona to description:', error);
    toast.error('Failed to convert persona to description');
    throw error;
  }
}