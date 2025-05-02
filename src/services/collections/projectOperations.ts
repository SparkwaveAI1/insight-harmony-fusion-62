
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Project, ProjectWithConversationCount } from "./types";

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
    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        project_conversations!inner (count)
      `)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    
    // Transform the data to match the ProjectWithConversationCount interface
    const transformedData = data?.map(project => ({
      ...project,
      conversation_count: project.project_conversations?.[0]?.count || 0
    })) as ProjectWithConversationCount[];
    
    return transformedData || [];
  } catch (error) {
    console.error("Error fetching projects with count:", error);
    toast.error("Failed to fetch projects");
    return [];
  }
};

/**
 * Creates a new project
 */
export const createProject = async (name: string, description: string | null = null): Promise<Project | null> => {
  try {
    // Get the user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to create a project");
      return null;
    }
    
    // Insert with the user_id
    const { data, error } = await supabase
      .from("projects")
      .insert({ name, description, user_id: user.id })
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
  updates: { name?: string; description?: string | null }
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
