
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  image?: string; // Base64 encoded image data
  imageUrl?: string; // URL to the image if stored
}

export type ChatMode = 'conversation';
