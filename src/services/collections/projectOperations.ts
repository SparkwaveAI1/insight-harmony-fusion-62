import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Project, ProjectWithConversationCount } from "./types";

/**
 * Fetches a specific project by ID
 */
export const getProjectById = async (id: string): Promise<Project | null> => {
  try {
    console.log("=== getProjectById Debug Info ===");
    console.log("Project ID requested:", id);
    
    // Check authentication status
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log("Current user:", user?.id || "Not authenticated");
    console.log("Auth error:", authError);
    
    if (!user) {
      console.error("No authenticated user found");
      toast.error("Please log in to access this project");
      return null;
    }

    console.log("Making database query for project...");
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    console.log("Database response - data:", data);
    console.log("Database response - error:", error);
    
    if (error) {
      console.error("Database error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      if (error.code === 'PGRST116') {
        console.log("No rows returned - project not found or no access");
        toast.error("Project not found or you don't have access to it");
      } else {
        toast.error(`Database error: ${error.message}`);
      }
      return null;
    }

    console.log("Successfully fetched project:", data?.name);
    return data as Project;
  } catch (error) {
    console.error("=== Unexpected error in getProjectById ===");
    console.error("Error type:", typeof error);
    console.error("Error object:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    toast.error("An unexpected error occurred while fetching the project");
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
    console.log("=== getUserProjectsWithCount Debug Info ===");
    
    // Check authentication status
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log("Current user for projects list:", user?.id || "Not authenticated");
    
    if (!user) {
      console.error("No authenticated user for projects list");
      toast.error("Please log in to view your projects");
      return [];
    }

    // First fetch the projects
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("*")
      .order("updated_at", { ascending: false });

    console.log("Projects query result:", { projects: projects?.length || 0, error: projectsError });

    if (projectsError) {
      console.error("Projects query error:", projectsError);
      throw projectsError;
    }
    
    if (!projects || projects.length === 0) {
      console.log("No projects found for user");
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
