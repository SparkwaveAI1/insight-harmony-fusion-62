
import { v4 as uuidv4 } from 'uuid';
import { Persona } from './types';
import { savePersona } from './operations/savePersona'; // Updated import path
import { supabase } from '@/integrations/supabase/client';

export async function generatePersona(prompt: string): Promise<Persona | null> {
  try {
    // Fetch the current user's ID to associate with the persona
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    if (!userId) {
      console.error("No authenticated user found when generating persona");
      throw new Error("You must be logged in to create personas");
    } else {
      console.log("Creating persona for user:", userId);
    }
    
    // Create a unique ID for the persona
    const personaId = uuidv4().substring(0, 8);
    
    console.log("Sending request to generate persona with prompt:", prompt);
    
    // Call the Supabase Edge Function to generate the persona
    const response = await fetch(`https://wgerdrdsuusnrdnwwelt.supabase.co/functions/v1/generate-persona`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: JSON.stringify({ 
        prompt,
        userId // Send the userId to the Edge Function
      }),
    });

    // Check for HTTP errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response from API:", response.status, errorText);
      throw new Error(`Error generating persona: ${response.statusText} (${response.status})`);
    }

    // Parse the response
    const personaData = await response.json();
    console.log("Generated persona data received:", personaData);
    
    // Validate the response
    if (!personaData || !personaData.success) {
      console.error("Invalid response from API:", personaData);
      throw new Error(personaData?.error || 'Invalid response from persona generation API');
    }
    
    // Add additional fields to the persona according to the database schema
    const persona: Persona = {
      ...personaData.persona,
      id: uuidv4(),
      persona_id: personaId,
      creation_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      prompt,
      is_public: false,
      user_id: userId, // Set the user_id from the authenticated user
    };
    
    console.log("Final persona object to be saved:", persona);
    
    // Save the persona to the database
    const savedPersona = await savePersona(persona);
    
    if (!savedPersona) {
      console.error("Failed to save persona to database");
      throw new Error("Failed to save persona to database");
    }
    
    console.log("Successfully saved persona:", savedPersona);
    return persona;
    
  } catch (error) {
    console.error("Error in generatePersona:", error);
    throw error;
  }
}
