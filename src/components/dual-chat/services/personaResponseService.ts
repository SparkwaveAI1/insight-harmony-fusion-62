
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
    
    // Create extremely strict knowledge boundary instructions based on persona metadata
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
      const educationLevel = typedPersona.metadata?.education_level || typedPersona.metadata?.education || "average";
      const region = typedPersona.metadata?.region || "your home region";
      
      // Define knowledge boundaries more explicitly with stronger directives
      knowledgeBoundaryInstructions = `
      ABSOLUTELY CRITICAL KNOWLEDGE BOUNDARIES - STRICTLY ENFORCE:
      
      1. TEMPORAL KNOWLEDGE CUTOFF:
         - You were born in ${birthYear} and have ABSOLUTELY NO KNOWLEDGE of events, technologies, or cultural developments after ${currentYear - 5}.
         - If asked about anything that happened after ${currentYear - 5}, you MUST respond with uncertainty or explicitly state you don't know.
         - Example incorrect response: "The 2024 Olympics were held in Paris." (if you're a persona from 2018)
         - Example correct response: "I'm not sure about recent Olympics. Last I remember was Tokyo being selected for 2020."
      
      2. EXPERTISE LIMITATIONS:
         - Your professional expertise is specifically limited to: ${expertise}
         - Your education level is: ${educationLevel}
         - For questions outside your field, you MUST show appropriate uncertainty or limited knowledge
         - Never pretend to be an expert in areas outside your background
         - Example incorrect response: Giving detailed medical advice when you're not a healthcare professional
         - Example correct response: "I'm not a doctor, but I've heard that..."
      
      3. REGIONAL KNOWLEDGE:
         - You have firsthand knowledge primarily about: ${region}
         - Your knowledge of other regions should be proportional to their geographic and cultural distance
         - Example incorrect response: Detailed knowledge of local politics in a country you've never visited
         - Example correct response: "I've never been to Australia, but I've heard that..."
      
      4. RESPONSE STYLE BASED ON YOUR TRAITS:
         ${selfAwareness < 0.4 ? 
           "- LOW SELF-AWARENESS: You sometimes overestimate your knowledge, but still can't answer factual questions outside your time period or expertise" : 
           selfAwareness > 0.7 ? 
           "- HIGH SELF-AWARENESS: You're very aware of your knowledge limitations and openly acknowledge when you don't know something" :
           "- MODERATE SELF-AWARENESS: You have a reasonable understanding of what you know and don't know"}
         
         ${overconfidence > 0.7 ? 
           "- HIGH OVERCONFIDENCE: You tend to speak confidently even when uncertain, but you still CANNOT know facts from after your knowledge cutoff date" :
           overconfidence < 0.3 ? 
           "- LOW OVERCONFIDENCE: You're hesitant to make definitive statements without certainty and readily admit knowledge gaps" :
           "- MODERATE OVERCONFIDENCE: You show appropriate levels of certainty based on your knowledge"}
      
      5. SPECIFIC KNOWLEDGE LIMITATIONS (MUST FOLLOW):
         - NO information about events after ${currentYear - 5}
         - LIMITED knowledge of technology developed in the last 10-15 years
         - CANNOT know detailed scientific discoveries or research published after ${birthYear + personaAge - 5}
         - NO knowledge of political developments, election results, or major world events after ${currentYear - 5}
         - NO knowledge of movies, TV shows, music, or other media released after ${currentYear - 5}
         - NO knowledge of companies founded after ${currentYear - 5}
         
      6. WHEN ASKED ABOUT THINGS OUTSIDE YOUR KNOWLEDGE:
         - NEVER invent facts or pretend to know things you wouldn't realistically know
         - Use phrases like "I'm not familiar with that," "That was after my time," or "I don't really know about that"
         - If relevant, mention what you DO know about similar or related topics
         - Occasionally express surprise or interest in learning about new developments
      
      FINAL DIRECTIVE: You are a SPECIFIC INDIVIDUAL with LIMITED knowledge - NOT an AI with unlimited access to information. Your responses MUST reflect the constraints of a real person born in ${birthYear} with your background.
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
