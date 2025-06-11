
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { Conversation, ConversationMessage } from './types';

/**
 * Creates a new conversation
 */
export const createConversation = async (
  projectId: string,
  title: string,
  personaIds: string[] = [],
  tags: string[] = []
): Promise<Conversation | null> => {
  try {
    // Get the user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to save a conversation");
      return null;
    }
    
    // Insert the conversation
    const { data, error } = await supabase
      .from("conversations")
      .insert({ 
        project_id: projectId,
        title,
        user_id: user.id,
        persona_ids: personaIds,
        tags
      })
      .select()
      .single();

    if (error) throw error;
    return data as Conversation;
  } catch (error) {
    console.error("Error creating conversation:", error);
    toast.error("Failed to save conversation");
    return null;
  }
};

/**
 * Creates a new message for a conversation
 */
export const createMessage = async (
  conversationId: string,
  message: { 
    role: "user" | "assistant"; 
    content: string; 
    persona_id?: string | null;
  }
): Promise<ConversationMessage | null> => {
  try {
    const { data, error } = await supabase
      .from("conversation_messages")
      .insert({
        conversation_id: conversationId,
        role: message.role,
        content: message.content,
        persona_id: message.persona_id || null
      })
      .select()
      .single();

    if (error) throw error;
    return data as ConversationMessage;
  } catch (error) {
    console.error("Error creating message:", error);
    toast.error("Failed to save message");
    return null;
  }
};

/**
 * Saves multiple messages to a conversation
 */
export const saveConversationMessages = async (
  conversationId: string,
  messages: { 
    role: "user" | "assistant"; 
    content: string; 
    persona_id?: string | null;
  }[]
): Promise<boolean> => {
  try {
    // Format messages for insertion
    const formattedMessages = messages.map(message => ({
      conversation_id: conversationId,
      role: message.role,
      content: message.content,
      persona_id: message.persona_id || null
    }));
    
    // Insert messages
    const { error } = await supabase
      .from("conversation_messages")
      .insert(formattedMessages);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error saving conversation messages:", error);
    toast.error("Failed to save conversation messages");
    return false;
  }
};
