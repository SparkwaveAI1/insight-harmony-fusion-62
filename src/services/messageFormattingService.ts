import { Message } from '@/components/persona-chat/types';

export interface FormattedMessage {
  role: string;
  content: string;
  file_data?: string;
  file_type?: string;
  file_name?: string;
}

export class MessageFormattingService {
  static async formatMessageHistory(messages: Message[]): Promise<FormattedMessage[]> {
    return Promise.all(messages.map(async (msg) => {
      const baseMessage: FormattedMessage = {
        role: msg.role,
        content: msg.content,
      };

      if (msg.file && msg.file instanceof File) {
        const { FileHandlingService } = await import('./fileHandlingService');
        const processedFile = await FileHandlingService.processFile(msg.file);
        
        return {
          ...baseMessage,
          file_data: processedFile.base64Data,
          file_type: processedFile.type,
          file_name: processedFile.name
        };
      }

      return baseMessage;
    }));
  }

  static breakIntoMultipleMessages(responseText: string): string[] {
    // If response is already short, return as is
    if (responseText.length < 100) return [responseText];
    
    // Split by paragraphs first
    const paragraphs = responseText.split(/\n\n+/);
    
    // If we have multiple paragraphs, use those as separate messages
    if (paragraphs.length > 1) {
      return paragraphs.filter(p => p.trim().length > 0);
    }
    
    // Otherwise, try to find natural breaking points like sentence endings
    const sentences = responseText.match(/[^.!?]+[.!?]+/g) || [responseText];
    
    // If very long sentence, just break by length
    if (sentences.length === 1 && sentences[0].length > 150) {
      const chunks = [];
      let current = '';
      const words = responseText.split(' ');
      
      for (const word of words) {
        if ((current + ' ' + word).length > 100) {
          chunks.push(current);
          current = word;
        } else {
          current += (current ? ' ' : '') + word;
        }
      }
      
      if (current) chunks.push(current);
      return chunks;
    }
    
    // Group sentences into reasonable message sizes
    const messages = [];
    let currentMessage = '';
    
    for (const sentence of sentences) {
      if (currentMessage.length + sentence.length > 150) {
        messages.push(currentMessage);
        currentMessage = sentence;
      } else {
        currentMessage += currentMessage ? ' ' + sentence : sentence;
      }
    }
    
    if (currentMessage) messages.push(currentMessage);
    return messages;
  }

  static createUserMessage(content: string, file?: File): Message {
    return {
      role: 'user',
      content,
      timestamp: new Date(),
      file
    };
  }

  static createAssistantMessage(content: string): Message {
    return {
      role: 'assistant',
      content,
      timestamp: new Date()
    };
  }
}
