
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface Participant {
  id?: string;
  email: string;
  screener_passed: boolean;
  questionnaire_data: Json;  // Changed from Record<string, any> to Json
  interview_unlocked: boolean;
  unlock_code?: string;
  interview_completed: boolean;
  consent_accepted?: boolean; 
  consent_date?: string;
  transcript_url?: string;
  audio_url?: string;
  unique_identifier?: string;
  created_at?: string;
}

// Export the Supabase client so other files can import it
export { supabase };

// Create a new participant
export async function createParticipant(participant: Omit<Participant, 'id' | 'created_at'>): Promise<Participant | null> {
  try {
    console.log("Creating participant in Supabase:", participant);
    const { data, error } = await supabase
      .from('participants')
      .insert(participant)
      .select()
      .single();

    if (error) {
      console.error('Error creating participant:', error);
      throw error;
    }
    
    console.log("Participant created successfully:", data);
    return data;
  } catch (error) {
    console.error('Error creating participant:', error);
    return null;
  }
}

// Get a participant by email
export async function getParticipantByEmail(email: string): Promise<Participant | null> {
  try {
    console.log("Getting participant by email:", email);
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {  // PGRST116 is "no rows returned" error
      console.error('Error getting participant:', error);
      throw error;
    }
    
    console.log("Participant retrieved:", data);
    return data;
  } catch (error) {
    console.error('Error getting participant:', error);
    return null;
  }
}

// Get a participant by ID
export async function getParticipantById(id: string): Promise<Participant | null> {
  try {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting participant by ID:', error);
    return null;
  }
}

// Update a participant's questionnaire data
export async function updateParticipantQuestionnaire(email: string, questionnaireData: Record<string, any>): Promise<boolean> {
  try {
    // First get the existing participant data
    const participant = await getParticipantByEmail(email);
    if (!participant) {
      throw new Error(`Participant with email ${email} not found`);
    }

    // Safely handle the existing data - convert from Json to object if needed
    const existingData = participant.questionnaire_data as Record<string, any> || {};
    
    // Update the questionnaire data
    const { error } = await supabase
      .from('participants')
      .update({
        questionnaire_data: {
          ...existingData,
          ...questionnaireData
        }
      })
      .eq('email', email);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating participant questionnaire:', error);
    return false;
  }
}

// Update participant questionnaire by ID
export async function updateParticipantQuestionnaireById(id: string, questionnaireData: Record<string, any>): Promise<boolean> {
  try {
    // First get the existing participant data
    const participant = await getParticipantById(id);
    if (!participant) {
      throw new Error(`Participant with ID ${id} not found`);
    }

    // Safely handle the existing data - convert from Json to object if needed
    const existingData = participant.questionnaire_data as Record<string, any> || {};
    
    // Update the questionnaire data
    const { error } = await supabase
      .from('participants')
      .update({
        questionnaire_data: {
          ...existingData,
          ...questionnaireData
        }
      })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating participant questionnaire by ID:', error);
    return false;
  }
}

// Update a participant's interview data
export async function updateParticipantInterview(
  participantId: string, 
  updates: Partial<Pick<Participant, 'interview_completed' | 'transcript_url' | 'audio_url'>>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('participants')
      .update(updates)
      .eq('id', participantId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating participant interview:', error);
    return false;
  }
}

// Generate and store an unlock code for a participant
export async function generateUnlockCode(email: string): Promise<string | null> {
  try {
    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    const { error } = await supabase
      .from('participants')
      .update({ unlock_code: code })
      .eq('email', email);

    if (error) throw error;
    return code;
  } catch (error) {
    console.error('Error generating unlock code:', error);
    return null;
  }
}

// Generate an unlock code by participant ID
export async function generateUnlockCodeById(id: string): Promise<string | null> {
  try {
    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    const { error } = await supabase
      .from('participants')
      .update({ unlock_code: code })
      .eq('id', id);

    if (error) throw error;
    return code;
  } catch (error) {
    console.error('Error generating unlock code by ID:', error);
    return null;
  }
}

// Validate an unlock code
export async function validateUnlockCode(email: string, code: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('email', email)
      .eq('unlock_code', code)
      .single();

    if (error) throw error;
    
    if (data) {
      // If code is valid, mark the interview as unlocked
      await supabase
        .from('participants')
        .update({ interview_unlocked: true })
        .eq('id', data.id);
        
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error validating unlock code:', error);
    return false;
  }
}

// Validate unlock code by participant ID
export async function validateUnlockCodeById(id: string, code: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('id', id)
      .eq('unlock_code', code)
      .single();

    if (error) throw error;
    
    if (data) {
      // If code is valid, mark the interview as unlocked
      await supabase
        .from('participants')
        .update({ interview_unlocked: true })
        .eq('id', data.id);
        
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error validating unlock code by ID:', error);
    return false;
  }
}

// Save interview transcript
export async function saveTranscript(participantId: string, transcript: string): Promise<string | null> {
  try {
    const fileName = `transcript_${participantId}_${Date.now()}.json`;
    
    // Upload transcript to Supabase storage
    const { data, error } = await supabase
      .storage
      .from('transcripts')
      .upload(fileName, JSON.stringify({ transcript }), {
        contentType: 'application/json',
      });

    if (error) throw error;
    
    // Get the public URL for the uploaded file
    const { data: urlData } = supabase
      .storage
      .from('transcripts')
      .getPublicUrl(fileName);
      
    // Update the participant record with the transcript URL
    await updateParticipantInterview(participantId, {
      transcript_url: urlData.publicUrl
    });
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error saving transcript:', error);
    return null;
  }
}

// Save interview audio
export async function saveAudio(participantId: string, audioBlob: Blob): Promise<string | null> {
  try {
    const fileName = `audio_${participantId}_${Date.now()}.mp3`;
    
    // Upload audio to Supabase storage - updated to use 'interview-audio' bucket
    const { data, error } = await supabase
      .storage
      .from('interview-audio')
      .upload(fileName, audioBlob, {
        contentType: 'audio/mpeg',
      });

    if (error) throw error;
    
    // Get the public URL for the uploaded file
    const { data: urlData } = supabase
      .storage
      .from('interview-audio')
      .getPublicUrl(fileName);
      
    // Update the participant record with the audio URL
    await updateParticipantInterview(participantId, {
      audio_url: urlData.publicUrl
    });
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error saving audio:', error);
    return null;
  }
}

// Update a participant's consent status
export async function updateParticipantConsent(email: string, consentAccepted: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('participants')
      .update({
        consent_accepted: consentAccepted,
        consent_date: consentAccepted ? new Date().toISOString() : null
      })
      .eq('email', email);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating participant consent:', error);
    return false;
  }
}

// Update participant consent by ID
export async function updateParticipantConsentById(id: string, consentAccepted: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('participants')
      .update({
        consent_accepted: consentAccepted,
        consent_date: consentAccepted ? new Date().toISOString() : null
      })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating participant consent by ID:', error);
    return false;
  }
}
