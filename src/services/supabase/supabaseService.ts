
// Export the Supabase client
import { supabase } from '@/integrations/supabase/client';

// Export participant types and functions
export { 
  Participant,
  createParticipant,
  getParticipantByEmail,
  getParticipantById, 
  updateParticipantConsent,
  updateParticipantConsentById
} from './participants/participantService';

// Export questionnaire functions
export {
  updateParticipantQuestionnaire,
  updateParticipantQuestionnaireById
} from './participants/questionnaireService';

// Export interview functions
export {
  updateParticipantInterview,
  generateUnlockCode,
  generateUnlockCodeById,
  validateUnlockCode,
  validateUnlockCodeById
} from './participants/interviewService';

// Export storage functions
export {
  saveTranscript,
  saveAudio
} from './storage/uploadService';

// Re-export the Supabase client
export { supabase };
