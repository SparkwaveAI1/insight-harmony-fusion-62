import { Message } from '@/components/persona-chat/types';
import { Persona } from '@/services/persona/types';

// Extended message type for research sessions
export interface ResearchMessage extends Message {
  responding_persona_id?: string;
}

// Session data interface
export interface SessionData {
  sessionId: string | null;
  loadedPersonas: Persona[];
  messages: ResearchMessage[];
  isLoading: boolean;
}

// Research session props
export interface ResearchSessionHookReturn {
  sessionId: string | null;
  loadedPersonas: Persona[];
  messages: ResearchMessage[];
  isLoading: boolean;
  selectedPersonaId: string | null;
  createSession: (selectedPersonaIds: string[], projectId?: string | null) => Promise<boolean>;
  sendMessage: (message: string, imageFile?: File | null) => Promise<void>;
  selectPersonaResponder: (personaId: string) => Promise<void>;
  clearSession: () => void;
  resetState: () => void;
}

// Component prop interfaces
export interface ResearchInterfaceProps {
  sessionData: SessionData;
  onCreateSession: (selectedPersonas: string[]) => Promise<boolean>;
  onSendMessage: (message: string, imageFile?: File | null) => Promise<void>;
  onSelectResponder: (personaId: string) => Promise<void>;
  projectId?: string | null;
}

export interface ResearchConversationProps {
  messages: ResearchMessage[];
  loadedPersonas: Persona[];
  isLoading: boolean;
  onSendMessage: (message: string, imageFile?: File | null) => void;
  onSelectResponder: (personaId: string) => void;
}

export interface ResearchMessageProps {
  message: ResearchMessage;
  persona?: Persona;
}

export interface ResearchMessageInputProps {
  onSendMessage: (message: string, imageFile?: File | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

export interface PersonaLoaderProps {
  maxPersonas: number;
  onStartSession: (selectedPersonas: string[]) => Promise<void>;
  isLoading: boolean;
}

// Service interfaces
export interface SessionServiceInterface {
  createSession: (personaIds: string[]) => Promise<string>;
  addMessage: (sessionId: string, content: string, role: 'user' | 'assistant', personaId?: string) => Promise<void>;
}

export interface PersonaResponseServiceInterface {
  generatePersonaResponse: (
    personaId: string,
    messageHistory: Message[],
    persona: Persona
  ) => Promise<string>;
}
