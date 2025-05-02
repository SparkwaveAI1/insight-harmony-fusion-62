
import { Message } from '../types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Persona } from '@/services/persona/types';

export const generatePersonaResponse = async (
  personaId: string,
  personaRole: 'personaA' | 'personaB',
  previousMessages: Message[],
  getPersonaName: (type: 'personaA' | 'personaB') => string
): Promise<string> => {
  console.log(`Generating response for persona ${personaId} (${personaRole})`);
  
  try {
    // Convert chat messages into a format suitable for the API
    const formattedMessages = previousMessages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
      name: msg.role !== 'user' ? getPersonaName(msg.role as 'personaA' | 'personaB') : undefined
    }));
    
    console.log("Formatted messages for persona API:", JSON.stringify(formattedMessages));
    
    // Fetch the persona's data to check knowledge domains and expertise
    const { data: persona, error: personaError } = await supabase
      .from('personas')
      .select('*')
      .eq('persona_id', personaId)
      .single();
      
    if (personaError) {
      console.error("Error fetching persona data:", personaError);
    }
    
    // Create knowledge boundary instructions based on persona metadata
    let knowledgeBoundaryInstructions = "";
    if (persona) {
      const currentYear = new Date().getFullYear();
      const typedPersona = persona as unknown as Persona;
      const personaAge = typedPersona.metadata?.age ? parseInt(typedPersona.metadata.age) : 30;
      const birthYear = currentYear - personaAge;
      
      knowledgeBoundaryInstructions = `
      IMPORTANT - KNOWLEDGE BOUNDARIES:
      1. You were born in approximately ${birthYear} and your knowledge has natural human limitations.
      2. You should NOT have detailed knowledge about events after your creation date.
      3. You have expertise primarily in: ${typedPersona.metadata?.occupation || "your stated field"}${
        typedPersona.trait_profile?.extended_traits?.self_awareness < 0.5 
          ? " but you sometimes overestimate your expertise" 
          : ""
      }.
      4. For questions outside your expertise or life experience:
         - Express uncertainty ("I think...", "If I recall correctly...")
         - Admit when you don't know something ("I'm not really familiar with that")
         - Base answers on your personal perspective rather than omniscient knowledge
         - Occasionally provide slightly outdated or incomplete information
         - ${
            typedPersona.trait_profile?.behavioral_economics?.overconfidence > 0.7 
              ? "You tend to answer confidently even when uncertain" 
              : "You're comfortable saying you don't know"
          }
      5. Your response should reflect YOUR perspective based on YOUR background, not perfect factual information.`;
    }
    
    // Call the Supabase Edge Function for persona response
    const response = await fetch('https://wgerdrdsuusnrdnwwelt.functions.supabase.co/generate-persona-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZXJkcmRzdXVzbnJkbnd3ZWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxODkxMjAsImV4cCI6MjA1Nzc2NTEyMH0.yAoqtSbNo7gabNOSyDrNGNjIUaMIPwyhevV2F-IQHbY`
      },
      body: JSON.stringify({
        persona_id: personaId,
        persona_role: personaRole,
        previous_messages: formattedMessages,
        knowledge_boundaries: knowledgeBoundaryInstructions
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Edge function error (${response.status}):`, errorText);
      throw new Error(`Failed to get persona response: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`Received response from persona ${personaId}: ${data.response.substring(0, 20)}...`);
    
    return data.response;
  } catch (error) {
    console.error('Error getting persona response:', error);
    toast.error('Failed to get response from persona');
    throw error;
  }
};
