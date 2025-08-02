
import { Message } from '@/components/persona-chat/types';
import { Persona } from '@/services/persona/types';
import { KnowledgeBaseDocument } from '@/services/collections';

export interface ResearchMessage extends Message {
  responding_persona_id?: string;
  images?: string[]; // Support for multiple images
}

export interface SessionData {
  sessionId: string | null;
  loadedPersonas: Persona[];
  projectDocuments?: KnowledgeBaseDocument[];
  messages: ResearchMessage[];
  isLoading: boolean;
}
