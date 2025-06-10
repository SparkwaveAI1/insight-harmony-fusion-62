
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Conversation, ConversationMessage } from "./types";

/**
 * Fetches a conversation by ID
 */
export const getConversationById = async (id: string): Promise<Conversation | null> => {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Conversation;
  } catch (error) {
    console.error("Error fetching conversation:", error);
    toast.error("Failed to fetch conversation");
    return null;
  }
};

/**
 * Fetches messages for a conversation
 */
export const getConversationMessages = async (conversationId: string): Promise<ConversationMessage[]> => {
  try {
    const { data, error } = await supabase
      .from("conversation_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data as ConversationMessage[] || [];
  } catch (error) {
    console.error("Error fetching conversation messages:", error);
    toast.error("Failed to fetch conversation messages");
    return [];
  }
};

/**
 * Creates a new conversation
 */
export const createConversation = async (
  title: string,
  personaIds: string[] = [],
  tags: string[] = [],
  projectId?: string
): Promise<Conversation | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to create a conversation");
      return null;
    }
    
    const conversationData: any = {
      title,
      user_id: user.id,
      persona_ids: personaIds,
      tags,
      session_type: 'chat'
    };

    if (projectId) {
      conversationData.project_id = projectId;
    }
    
    const { data, error } = await supabase
      .from("conversations")
      .insert(conversationData)
      .select()
      .single();

    if (error) throw error;
    toast.success("Conversation created");
    return data as Conversation;
  } catch (error) {
    console.error("Error creating conversation:", error);
    toast.error("Failed to create conversation");
    return null;
  }
};

/**
 * Saves messages to a conversation
 */
export const saveConversationMessages = async (
  conversationId: string,
  messages: { role: string; content: string; persona_id?: string }[]
): Promise<boolean> => {
  try {
    const messageData = messages.map(message => ({
      conversation_id: conversationId,
      role: message.role,
      content: message.content,
      persona_id: message.persona_id || null
    }));

    const { error } = await supabase
      .from("conversation_messages")
      .insert(messageData);

    if (error) throw error;
    toast.success("Messages saved");
    return true;
  } catch (error) {
    console.error("Error saving conversation messages:", error);
    toast.error("Failed to save messages");
    return false;
  }
};
