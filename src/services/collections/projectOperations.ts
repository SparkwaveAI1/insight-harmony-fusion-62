
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
 * Fetches all projects for the current user (basic version for selection dialogs)
 */
export const getUserProjects = async (): Promise<Project[]> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user found");
      return [];
    }

    console.log("Fetching projects for user:", user.id);

    // First get basic projects
    const { data: basicProjects, error: projectsError } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (projectsError) {
      console.error("Error fetching basic projects:", projectsError);
      throw projectsError;
    }

    console.log("Basic projects fetched:", basicProjects);

    if (!basicProjects || basicProjects.length === 0) {
      console.log("No projects found for user");
      return [];
    }

    // Then try to get additional data (collections and personas) for each project
    const projectsWithDetails = await Promise.all(
      basicProjects.map(async (project) => {
        try {
          const { data: projectCollections, error: collectionsError } = await supabase
            .from("project_collections")
            .select(`
              collection_id,
              collections (
                id,
                name,
                description,
                collection_personas (
                  persona_id
                )
              )
            `)
            .eq("project_id", project.id);

          if (collectionsError) {
            console.warn("Error fetching collections for project:", project.id, collectionsError);
            // Return project without collection data if there's an error
            return project;
          }

          return {
            ...project,
            project_collections: projectCollections || []
          };
        } catch (error) {
          console.warn("Error processing project:", project.id, error);
          // Return basic project if there's any error
          return project;
        }
      })
    );

    console.log("Projects with details:", projectsWithDetails);
    return projectsWithDetails as Project[];

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
