import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Conversation, ConversationMessage } from "./types";

/**
 * Fetches a specific conversation by ID
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
 * Fetches all messages for a conversation
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
 * Fetches all conversations for a specific project
 */
export const getProjectConversations = async (
  projectId: string,
  sessionType?: string
): Promise<Conversation[]> => {
  try {
    let query = supabase
      .from("conversations")
      .select("*")
      .eq("project_id", projectId);
    
    // Apply session_type filter if provided
    if (sessionType) {
      query = query.eq("session_type", sessionType);
    }
    
    const { data, error } = await query.order("updated_at", { ascending: false });

    if (error) throw error;
    return data as Conversation[] || [];
  } catch (error) {
    console.error("Error fetching project conversations:", error);
    toast.error("Failed to fetch project conversations");
    return [];
  }
};

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
 * Adds messages to a conversation
 */
export const saveConversationMessages = async (
  conversationId: string,
  messages: { role: "user" | "assistant"; content: string; persona_id?: string }[]
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

/**
 * Updates an existing conversation
 */
export const updateConversation = async (
  id: string,
  updates: { 
    title?: string; 
    tags?: string[];
    project_id?: string;
  }
): Promise<Conversation | null> => {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Conversation;
  } catch (error) {
    console.error("Error updating conversation:", error);
    toast.error("Failed to update conversation");
    return null;
  }
};

/**
 * Deletes a conversation
 */
export const deleteConversation = async (id: string): Promise<boolean> => {
  try {
    // Delete conversation messages first
    const { error: messagesError } = await supabase
      .from("conversation_messages")
      .delete()
      .eq("conversation_id", id);
    
    if (messagesError) throw messagesError;
    
    // Then delete the conversation
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", id);

    if (error) throw error;
    
    toast.success("Conversation deleted");
    return true;
  } catch (error) {
    console.error("Error deleting conversation:", error);
    toast.error("Failed to delete conversation");
    return false;
  }
};
