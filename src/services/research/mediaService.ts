
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ResearchMedia } from "./types";

/**
 * Allowed file types for uploading to research projects
 */
export const ALLOWED_FILE_TYPES = [
  // Documents
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "text/plain",
  
  // Images
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

/**
 * Check if the file type is allowed
 */
export const isAllowedFileType = (fileType: string): boolean => {
  return ALLOWED_FILE_TYPES.includes(fileType);
};

/**
 * Check if the file is a text-based document
 */
export const isTextDocument = (fileType: string): boolean => {
  return [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain"
  ].includes(fileType);
};

/**
 * Upload a file to a research project
 */
export const uploadResearchMedia = async (
  projectId: string,
  file: File
): Promise<ResearchMedia | null> => {
  try {
    // Get the user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to upload files");
      return null;
    }
    
    // Validate file type
    if (!isAllowedFileType(file.type)) {
      toast.error(`File type ${file.type} is not allowed`);
      return null;
    }
    
    // Generate a unique file name
    const timestamp = new Date().getTime();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${user.id}/${projectId}/${timestamp}_${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
    
    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('research_media')
      .upload(fileName, file);
      
    if (uploadError) throw uploadError;
    
    // Get the public URL
    const { data: urlData } = supabase
      .storage
      .from('research_media')
      .getPublicUrl(fileName);
      
    // Determine if file should be processed for text content
    const shouldProcess = isTextDocument(file.type);
    let textContent = null;
    
    // For simple text files, extract content immediately
    // For PDF and DOCX, this would typically be done in a background process
    if (shouldProcess && file.type === 'text/plain') {
      textContent = await file.text();
    }
    
    // Create a record in the research_media table
    const { data: mediaData, error: mediaError } = await supabase
      .from('research_media')
      .insert({
        user_id: user.id,
        project_id: projectId,
        file_name: fileName,
        file_type: file.type,
        file_size: file.size,
        file_path: uploadData?.path || fileName,
        original_name: file.name,
        file_url: urlData.publicUrl,
        is_processed: shouldProcess && textContent !== null,
        text_content: textContent
      })
      .select()
      .single();
      
    if (mediaError) throw mediaError;
    
    // Update the project with the new media ID using a custom RPC function
    const { error: updateError } = await supabase.rpc(
      'array_append_element',
      {
        table_name: 'research_projects',
        column_name: 'media_ids',
        row_id: projectId,
        new_element: mediaData.id
      }
    );
      
    if (updateError) throw updateError;
    
    toast.success("File uploaded successfully");
    return mediaData as ResearchMedia;
  } catch (error) {
    console.error("Error uploading research media:", error);
    toast.error("Failed to upload file");
    return null;
  }
};

/**
 * Get all media files for a research project
 */
export const getResearchProjectMedia = async (projectId: string): Promise<ResearchMedia[]> => {
  try {
    const { data, error } = await supabase
      .from("research_media")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
      
    if (error) throw error;
    return data as ResearchMedia[];
  } catch (error) {
    console.error("Error fetching research media:", error);
    toast.error("Failed to fetch project media");
    return [];
  }
};

/**
 * Delete a research media file
 */
export const deleteResearchMedia = async (mediaId: string, projectId: string): Promise<boolean> => {
  try {
    // Get the media file to get the file path
    const { data: media, error: fetchError } = await supabase
      .from("research_media")
      .select("file_path")
      .eq("id", mediaId)
      .single();
      
    if (fetchError) throw fetchError;
    
    // Delete the file from storage
    const { error: storageError } = await supabase
      .storage
      .from('research_media')
      .remove([media.file_path]);
      
    if (storageError) throw storageError;
    
    // Delete the record from the research_media table
    const { error: deleteError } = await supabase
      .from("research_media")
      .delete()
      .eq("id", mediaId);
      
    if (deleteError) throw deleteError;
    
    // Update the project to remove the media ID using a custom RPC function
    const { error: updateError } = await supabase.rpc(
      'array_remove_element',
      {
        table_name: 'research_projects',
        column_name: 'media_ids',
        row_id: projectId,
        element_to_remove: mediaId
      }
    );
      
    if (updateError) throw updateError;
    
    toast.success("File deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting research media:", error);
    toast.error("Failed to delete file");
    return false;
  }
};
