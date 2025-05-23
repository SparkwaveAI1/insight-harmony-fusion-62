
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ResearchProject, ResearchProjectInsert, ResearchProjectUpdate } from "./types";

/**
 * Fetch all research projects for the current user
 */
export const getUserResearchProjects = async (): Promise<ResearchProject[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to view research projects");
      return [];
    }
    
    const { data, error } = await supabase
      .from("research_projects")
      .select("*")
      .eq("created_by", user.id)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data as ResearchProject[];
  } catch (error) {
    console.error("Error fetching research projects:", error);
    toast.error("Failed to fetch research projects");
    return [];
  }
};

/**
 * Fetch a specific research project by ID
 */
export const getResearchProjectById = async (id: string): Promise<ResearchProject | null> => {
  try {
    const { data, error } = await supabase
      .from("research_projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as ResearchProject;
  } catch (error) {
    console.error("Error fetching research project:", error);
    toast.error("Failed to fetch research project");
    return null;
  }
};

/**
 * Create a new research project
 */
export const createResearchProject = async (project: ResearchProjectInsert): Promise<ResearchProject | null> => {
  try {
    // Get the user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to create a research project");
      return null;
    }
    
    // Ensure project has a title
    if (!project.title) {
      toast.error("Project title is required");
      return null;
    }
    
    const { data, error } = await supabase
      .from("research_projects")
      .insert({ ...project, created_by: user.id })
      .select()
      .single();

    if (error) throw error;
    toast.success("Research project created");
    return data as ResearchProject;
  } catch (error) {
    console.error("Error creating research project:", error);
    toast.error("Failed to create research project");
    return null;
  }
};

/**
 * Update an existing research project
 */
export const updateResearchProject = async (
  id: string,
  updates: ResearchProjectUpdate
): Promise<ResearchProject | null> => {
  try {
    const { data, error } = await supabase
      .from("research_projects")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    toast.success("Research project updated");
    return data as ResearchProject;
  } catch (error) {
    console.error("Error updating research project:", error);
    toast.error("Failed to update research project");
    return null;
  }
};

/**
 * Delete a research project
 */
export const deleteResearchProject = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("research_projects")
      .delete()
      .eq("id", id);

    if (error) throw error;
    toast.success("Research project deleted");
    return true;
  } catch (error) {
    console.error("Error deleting research project:", error);
    toast.error("Failed to delete research project");
    return false;
  }
};

/**
 * Add personas to a research project
 */
export const addPersonasToResearchProject = async (
  projectId: string,
  personaIds: string[]
): Promise<ResearchProject | null> => {
  try {
    // First get the current project to get existing persona IDs
    const { data: project, error: fetchError } = await supabase
      .from("research_projects")
      .select("persona_ids")
      .eq("id", projectId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Merge existing and new persona IDs, removing duplicates
    const existingIds = project?.persona_ids || [];
    const uniqueIds = [...new Set([...existingIds, ...personaIds])];
    
    // Update the project with the new set of persona IDs
    const { data, error } = await supabase
      .from("research_projects")
      .update({ persona_ids: uniqueIds })
      .eq("id", projectId)
      .select()
      .single();

    if (error) throw error;
    toast.success("Personas added to research project");
    return data as ResearchProject;
  } catch (error) {
    console.error("Error adding personas to research project:", error);
    toast.error("Failed to add personas to research project");
    return null;
  }
};

/**
 * Add collections to a research project
 */
export const addCollectionsToResearchProject = async (
  projectId: string,
  collectionIds: string[]
): Promise<ResearchProject | null> => {
  try {
    // First get the current project to get existing collection IDs
    const { data: project, error: fetchError } = await supabase
      .from("research_projects")
      .select("collection_ids")
      .eq("id", projectId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Merge existing and new collection IDs, removing duplicates
    const existingIds = project?.collection_ids || [];
    const uniqueIds = [...new Set([...existingIds, ...collectionIds])];
    
    // Update the project with the new set of collection IDs
    const { data, error } = await supabase
      .from("research_projects")
      .update({ collection_ids: uniqueIds })
      .eq("id", projectId)
      .select()
      .single();

    if (error) throw error;
    toast.success("Collections added to research project");
    return data as ResearchProject;
  } catch (error) {
    console.error("Error adding collections to research project:", error);
    toast.error("Failed to add collections to research project");
    return null;
  }
};
