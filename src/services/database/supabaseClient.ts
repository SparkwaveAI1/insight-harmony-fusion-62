
import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabaseTypes';

// Default to empty string if env vars are not defined
// In production, these would be set in the environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Add console log for debugging
console.log('Supabase client initialization. URL exists:', !!supabaseUrl, 'Key exists:', !!supabaseAnonKey);

// Create a mock client when credentials are missing
const createMockClient = () => {
  console.warn('Supabase credentials missing. Using mock client.');
  
  // Return a mock client with empty methods
  return {
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
    }),
    auth: {
      signUp: () => Promise.resolve({ data: null, error: null }),
      signIn: () => Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve({ error: null }),
    },
  };
};

// Create real client if we have credentials, otherwise use mock
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : createMockClient() as unknown as ReturnType<typeof createClient<Database>>;

// Participant operations for handling interview participants
export const participantOperations = {
  createParticipant: async (email: string, screeningData: any) => {
    console.log('Creating participant with email:', email);
    const { data, error } = await supabase
      .from('participants')
      .insert([{ email, screening_data: screeningData }])
      .select();
    
    if (error) {
      console.error('Error creating participant:', error);
      return null;
    }
    
    return data?.[0] || null;
  },
  
  getParticipantByEmail: async (email: string) => {
    console.log('Getting participant with email:', email);
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found - this is not an error for us
        return null;
      }
      console.error('Error getting participant:', error);
      return null;
    }
    
    return data;
  },
  
  updateParticipant: async (id: string, updates: any) => {
    console.log('Updating participant with id:', id);
    const { data, error } = await supabase
      .from('participants')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error updating participant:', error);
      return null;
    }
    
    return data?.[0] || null;
  }
};

// Questionnaire operations for handling pre-interview questionnaires
export const questionnaireOperations = {
  saveQuestionnaire: async (participantId: string, responses: any) => {
    console.log('Saving questionnaire for participant:', participantId);
    const { data, error } = await supabase
      .from('questionnaires')
      .insert([{ participant_id: participantId, responses }])
      .select();
    
    if (error) {
      console.error('Error saving questionnaire:', error);
      return null;
    }
    
    return data?.[0] || null;
  },
  
  getQuestionnaireByParticipantId: async (participantId: string) => {
    console.log('Getting questionnaire for participant:', participantId);
    const { data, error } = await supabase
      .from('questionnaires')
      .select('*')
      .eq('participant_id', participantId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found - this is not an error for us
        return null;
      }
      console.error('Error getting questionnaire:', error);
      return null;
    }
    
    return data;
  }
};

export default supabase;
