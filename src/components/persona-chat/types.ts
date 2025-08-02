
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  image?: string; // Base64 encoded image data
  imageUrl?: string; // URL to the image if stored
  additionalImages?: string[]; // Additional images for multi-image questions
  allImages?: string[]; // All images for comprehensive context
}
