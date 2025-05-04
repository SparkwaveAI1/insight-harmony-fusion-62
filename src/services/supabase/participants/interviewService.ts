
import { supabase } from '@/integrations/supabase/client';
import { Participant } from './participantService';

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
