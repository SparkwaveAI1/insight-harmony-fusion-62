
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Conversation } from "./types";

/**
 * Fetches conversations for a specific project
 */
export const getProjectConversations = async (projectId: string): Promise<Conversation[]> => {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("project_id", projectId)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data as Conversation[] || [];
  } catch (error) {
    console.error("Error fetching project conversations:", error);
    toast.error("Failed to fetch conversations");
    return [];
  }
};

/**
 * Creates a new conversation in a project
 */
export const createProjectConversation = async (
  projectId: string,
  title: string,
  personaIds: string[] = [],
  tags: string[] = []
): Promise<Conversation | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to create a conversation");
      return null;
    }
    
    const { data, error } = await supabase
      .from("conversations")
      .insert({
        title,
        project_id: projectId,
        user_id: user.id,
        persona_ids: personaIds,
        tags,
        session_type: 'research'
      })
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
