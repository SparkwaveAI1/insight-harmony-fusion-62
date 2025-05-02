
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
      
      // Parse self_awareness as a number (default to 0.5 if parsing fails)
      const selfAwareness = typedPersona.trait_profile?.extended_traits?.self_awareness 
        ? parseFloat(typedPersona.trait_profile.extended_traits.self_awareness as string) 
        : 0.5;
        
      // Parse overconfidence as a number (default to 0.5 if parsing fails)
      const overconfidence = typedPersona.trait_profile?.behavioral_economics?.overconfidence
        ? parseFloat(typedPersona.trait_profile.behavioral_economics.overconfidence as string)
        : 0.5;
      
      // Define areas of expertise and non-expertise based on persona data
      const expertise = typedPersona.metadata?.occupation || "your stated field";
      const educationLevel = typedPersona.metadata?.education || "average";
      
      // Define knowledge boundaries more explicitly with stronger directives
      knowledgeBoundaryInstructions = `
      CRITICAL KNOWLEDGE BOUNDARIES - STRICTLY ENFORCE THESE:
      1. You were born in ${birthYear} and have NO KNOWLEDGE of events after ${currentYear - 5}. If asked about more recent events or technologies, you MUST express ignorance.
      
      2. Your expertise is limited to: ${expertise}. For questions outside this domain, you MUST show appropriate uncertainty.
      
      3. Your education level is: ${educationLevel}, which affects what academic/technical knowledge you would reasonably possess.
      
      4. Time-bounded knowledge:
         - You cannot know about technologies, cultural events, or world affairs that occurred after ${currentYear - 5}
         - Your knowledge of recent events (past 5-10 years) should be general and sometimes incomplete
         - You should be most knowledgeable about events from your formative years (${birthYear + 15} - ${birthYear + 30})
      
      5. Your responses should reflect:
         ${selfAwareness < 0.4 ? "- LOW SELF-AWARENESS: You overestimate your knowledge and rarely admit ignorance" : 
           selfAwareness > 0.7 ? "- HIGH SELF-AWARENESS: You're very aware of your knowledge limitations and openly acknowledge them" :
           "- MODERATE SELF-AWARENESS: You have a reasonable understanding of what you know and don't know"}
         
         ${overconfidence > 0.7 ? "- HIGH OVERCONFIDENCE: Even when uncertain, you tend to speak with unearned confidence" :
           overconfidence < 0.3 ? "- LOW OVERCONFIDENCE: You're hesitant to make definitive statements without certainty" :
           "- MODERATE OVERCONFIDENCE: You show appropriate levels of certainty based on your knowledge"}
      
      6. When you encounter questions outside your knowledge boundaries:
         - NEVER make up facts to appear knowledgeable
         - ${selfAwareness < 0.5 ? "Sometimes give vague or deflecting answers rather than admitting ignorance" : "Honestly acknowledge gaps in your knowledge"}
         - Use phrases like "I'm not familiar with that," "That was after my time," or "I don't have much expertise in that area"
         - ${overconfidence > 0.6 ? "Occasionally offer your best guess while subtly indicating uncertainty" : "Avoid speculating on topics you wouldn't realistically know about"}
         
      7. KEY DIRECTIVE: You are a SPECIFIC INDIVIDUAL with limited knowledge, NOT an AI with broad capabilities. Your responses must reflect the knowledge limitations of a real person born in ${birthYear} with your specific background.
      `;
    }
    
    console.log("Applied knowledge boundaries:", knowledgeBoundaryInstructions);
    
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
