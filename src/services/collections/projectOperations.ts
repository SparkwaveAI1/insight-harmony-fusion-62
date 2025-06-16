import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Project, ProjectWithConversationCount, Conversation } from "./types";

/**
 * Fetches a specific project by ID
 */
export const getProjectById = async (id: string): Promise<Project | null> => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Project;
  } catch (error) {
    console.error("Error fetching project:", error);
    toast.error("Failed to fetch project");
    return null;
  }
};

/**
 * Fetches all projects for the current user
 */
export const getUserProjects = async (): Promise<Project[]> => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data as Project[] || [];
  } catch (error) {
    console.error("Error fetching projects:", error);
    toast.error("Failed to fetch projects");
    return [];
  }
};

/**
 * Fetches all projects with conversation count for the current user
 */
export const getUserProjectsWithCount = async (): Promise<ProjectWithConversationCount[]> => {
  try {
    // First fetch the projects
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("*")
      .order("updated_at", { ascending: false });

    if (projectsError) throw projectsError;
    
    if (!projects || projects.length === 0) {
      return [];
    }
    
    // Manually count conversations for each project
    const projectsWithCount = await Promise.all(
      projects.map(async (project) => {
        const { count, error: countError } = await supabase
          .from("conversations")
          .select("*", { count: "exact", head: true })
          .eq("project_id", project.id);

        if (countError) {
          console.error("Error counting conversations for project:", countError);
          return {
            ...project,
            conversation_count: 0
          };
        }

        return {
          ...project,
          conversation_count: count || 0
        };
      })
    );
    
    return projectsWithCount;
  } catch (error) {
    console.error("Error fetching projects with count:", error);
    toast.error("Failed to fetch projects");
    return [];
  }
};

/**
 * Creates a new project
 */
export const createProject = async (
  name: string, 
  description: string | null = null,
  information: string | null = null,
  researchObjectives: string | null = null,
  methodology: string | null = null
): Promise<Project | null> => {
  try {
    // Get the user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to create a project");
      return null;
    }
    
    // Insert with the user_id and new fields
    const { data, error } = await supabase
      .from("projects")
      .insert({ 
        name, 
        description, 
        information,
        research_objectives: researchObjectives,
        methodology,
        user_id: user.id 
      })
      .select()
      .single();

    if (error) throw error;
    toast.success("Project created");
    return data as Project;
  } catch (error) {
    console.error("Error creating project:", error);
    toast.error("Failed to create project");
    return null;
  }
};

/**
 * Updates an existing project
 */
export const updateProject = async (
  id: string,
  updates: { 
    name?: string; 
    description?: string | null;
    information?: string | null;
    research_objectives?: string | null;
    methodology?: string | null;
  }
): Promise<Project | null> => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    toast.success("Project updated");
    return data as Project;
  } catch (error) {
    console.error("Error updating project:", error);
    toast.error("Failed to update project");
    return null;
  }
};

/**
 * Deletes a project
 */
export const deleteProject = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) throw error;
    toast.success("Project deleted");
    return true;
  } catch (error) {
    console.error("Error deleting project:", error);
    toast.error("Failed to delete project");
    return false;
  }
};

/**
 * Fetches all conversations for a specific project
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
