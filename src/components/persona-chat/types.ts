
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  persona_id?: string; // Added to track which persona is speaking
  knowledge_confidence?: number; // 0-1 rating of how confident the persona is about this topic
  emotional_state?: string; // Reflects the dynamic state of the persona during this message
  belief_certainty?: number; // How certain the persona is about their response (0-1)
}

export interface PersonaOption {
  id: string;
  name: string;
}
