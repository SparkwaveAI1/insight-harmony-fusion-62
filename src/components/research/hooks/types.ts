
import { Message } from '@/components/persona-chat/types';
import { Persona } from '@/services/persona/types';

export interface ResearchMessage extends Message {
  personaId?: string;
  personaName?: string;
  sessionId?: string;
}

export interface LoadedPersona {
  persona_id: string;
  name: string;
  image_url?: string;
  metadata?: any;
}

export interface ResearchSession {
  sessionId: string;
  personas: LoadedPersona[];
}

export interface SessionData {
  sessionId: string | null;
  loadedPersonas: LoadedPersona[];
  messages: ResearchMessage[];
  isLoading: boolean;
}
