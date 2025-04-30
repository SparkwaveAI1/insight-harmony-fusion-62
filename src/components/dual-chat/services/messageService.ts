
import { Message } from '../types';
import { generatePersonaResponse } from './personaResponseService';

export interface MessageServiceProps {
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setIsResponding: (isResponding: boolean) => void;
  getPersonaName: (type: 'personaA' | 'personaB') => string;
}

export const createMessageService = ({
  setMessages,
  setIsResponding,
  getPersonaName
}: MessageServiceProps) => {
  const addMessage = (role: 'personaA' | 'personaB' | 'user', content: string, target?: 'personaA' | 'personaB') => {
    const newMessage = {
      role,
      content,
      timestamp: new Date(),
      target
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
    return newMessage;
  };
  
  const generateResponseFor = async (
    personaId: string,
    personaRole: 'personaA' | 'personaB',
    previousMessages: Message[]
  ) => {
    setIsResponding(true);
    try {
      const response = await generatePersonaResponse(
        personaId, 
        personaRole, 
        previousMessages,
        getPersonaName
      );
      setIsResponding(false);
      return response;
    } catch (error) {
      setIsResponding(false);
      throw error;
    }
  };

  return {
    addMessage,
    generateResponseFor
  };
};
