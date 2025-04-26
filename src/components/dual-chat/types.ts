
export interface Message {
  role: 'personaA' | 'personaB' | 'user';
  content: string;
  timestamp: Date;
  target?: 'personaA' | 'personaB';
}

export interface DualChatProps {
  personaAId: string;
  personaBId: string;
}
