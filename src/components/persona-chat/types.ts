
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  persona_id?: string; // Added to track which persona is speaking
}

export interface PersonaOption {
  id: string;
  name: string;
}
