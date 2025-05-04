
import { supabase } from '@/integrations/supabase/client';
import { getParticipantByEmail, getParticipantById } from './participantService';

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
