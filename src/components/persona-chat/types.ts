
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  file?: File;
  image?: string; // base64 encoded image for backwards compatibility
}

export interface PersonaChatContext {
  personaId: string;
  messages: Message[];
  isResponding: boolean;
}
