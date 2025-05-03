
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
    // First fetch the projects
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("*")
      .order("updated_at", { ascending: false });

    if (projectsError) throw projectsError;
    
    if (!projects || projects.length === 0) {
      return [];
    }
    
    // Now get the counts from the project_conversations view
    const { data: counts, error: countsError } = await supabase
      .from("project_conversations")
      .select("project_id, count");
    
    if (countsError) {
      console.error("Error fetching conversation counts:", countsError);
      // Continue with projects but without counts
      return projects.map(project => ({
        ...project,
        conversation_count: 0
      }));
    }
    
    // Create a map of project_id to count
    const countMap = new Map();
    counts?.forEach(item => {
      // Convert count to number before storing in the map
      countMap.set(item.project_id, typeof item.count === 'string' ? parseInt(item.count) : item.count || 0);
    });
    
    // Merge projects with counts
    const projectsWithCount = projects.map(project => ({
      ...project,
      conversation_count: countMap.get(project.id) || 0
    }));
    
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
