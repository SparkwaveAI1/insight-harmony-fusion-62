
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
 * Fetches minimal project data for selection UI - OPTIMIZED
 * Only loads id, name, and created_at for better performance
 */
export const getUserProjectsForSelection = async (): Promise<{ id: string; name: string; created_at: string }[]> => {
  const startTime = performance.now();
  
  try {
    console.log('🔍 Fetching user projects for selection (lightweight)...');
    
    const { data, error } = await supabase
      .from("projects")
      .select("id, name, created_at")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    
    const endTime = performance.now();
    console.log(`✅ Projects for selection loaded in ${(endTime - startTime).toFixed(2)}ms - Found ${data?.length || 0} projects`);
    
    return data || [];
  } catch (error) {
    const endTime = performance.now();
    console.error(`❌ Projects selection loading failed after ${(endTime - startTime).toFixed(2)}ms:`, error);
    toast.error("Failed to fetch projects");
    return [];
  }
};

/**
 * Fetches all projects for the current user - FULL DATA
 */
export const getUserProjects = async (): Promise<Project[]> => {
  const startTime = performance.now();
  
  try {
    console.log('🔍 Fetching user projects (full data)...');
    
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    
    const endTime = performance.now();
    console.log(`✅ Projects loaded in ${(endTime - startTime).toFixed(2)}ms - Found ${data?.length || 0} projects`);
    
    return data as Project[] || [];
  } catch (error) {
    const endTime = performance.now();
    console.error(`❌ Projects loading failed after ${(endTime - startTime).toFixed(2)}ms:`, error);
    toast.error("Failed to fetch projects");
    return [];
  }
};

/**
 * Fetches all projects with conversation count for the current user - OPTIMIZED
 */
export const getUserProjectsWithCount = async (): Promise<ProjectWithConversationCount[]> => {
  const startTime = performance.now();
  
  try {
    console.log('🔍 Fetching projects with conversation counts...');
    
    // Use the optimized database function for a single query
    const { data, error } = await supabase.rpc('get_user_projects_with_counts');

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    const endTime = performance.now();
    console.log(`✅ Projects loaded in ${(endTime - startTime).toFixed(2)}ms - Found ${data?.length || 0} projects`);
    
    return (data || []).map(project => ({
      ...project,
      conversation_count: Number(project.conversation_count) || 0
    }));
  } catch (error) {
    const endTime = performance.now();
    console.error(`❌ Projects loading failed after ${(endTime - startTime).toFixed(2)}ms:`, error);
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
