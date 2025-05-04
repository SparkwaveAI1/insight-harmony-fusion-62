
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface Participant {
  id?: string;
  email: string;
  screener_passed: boolean;
  questionnaire_data: Json;
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
