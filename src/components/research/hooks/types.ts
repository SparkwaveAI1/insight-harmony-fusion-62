
import { Message } from '@/components/persona-chat/types';
import { Persona } from '@/services/persona/types';

export interface ResearchMessage extends Message {
  responding_persona_id?: string;
}

export interface SessionData {
  sessionId: string | null;
  loadedPersonas: Persona[];
  messages: ResearchMessage[];
  isLoading: boolean;
}
