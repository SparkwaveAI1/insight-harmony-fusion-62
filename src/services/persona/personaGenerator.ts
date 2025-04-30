
import { v4 as uuidv4 } from 'uuid';
import { Persona } from './types';
import { savePersona } from './personaService';
import { supabase } from '@/integrations/supabase/client';

export async function generatePersona(prompt: string): Promise<Persona | null> {
  try {
    // Fetch the current user's ID to associate with the persona
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    // Create a unique ID for the persona
    const personaId = Math.random().toString(36).substring(2, 10);
    
    const response = await fetch(`https://wgerdrdsuusnrdnwwelt.supabase.co/functions/v1/generate-persona`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`Error generating persona: ${response.statusText}`);
    }

    const personaData = await response.json();
    console.log("Generated persona data:", personaData);
    
    if (!personaData) {
      throw new Error('No persona data returned from API');
    }
    
    // Add additional fields to the persona
    const persona: Persona = {
      ...personaData,
      id: uuidv4(),
      persona_id: personaId,
      creation_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      prompt,
      created_by: userId || undefined,
      is_public: false,
    };
    
    // Save the persona to the database
    const savedPersona = await savePersona(persona);
    return savedPersona;
    
  } catch (error) {
    console.error("Error in generatePersona:", error);
    throw error;
  }
}
