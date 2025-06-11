
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface KnowledgeBaseDocument {
  id: string;
  title: string;
  content: string | null;
  file_url: string | null;
  file_type: string | null;
  file_size: number | null;
  project_id: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Upload a document to the project knowledge base
 */
export const uploadKnowledgeBaseDocument = async (
  projectId: string,
  title: string,
  content?: string,
  file?: File
): Promise<KnowledgeBaseDocument | null> => {
  try {
    // Get the user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to upload documents");
      return null;
    }

    let fileUrl = null;
    let fileType = null;
    let fileSize = null;

    // If a file is provided, upload it to storage
    if (file) {
      const fileName = `${projectId}/${Date.now()}-${file.name}`;
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('project-documents')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        toast.error('Failed to upload file');
        return null;
      }

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('project-documents')
        .getPublicUrl(fileName);

      fileUrl = publicUrl;
      fileType = file.type;
      fileSize = file.size;
    }

    // Insert the document record
    const { data, error } = await supabase
      .from('knowledge_base_documents')
      .insert({
        project_id: projectId,
        title,
        content,
        file_url: fileUrl,
        file_type: fileType,
        file_size: fileSize,
        uploaded_by: user.id
      })
      .select()
      .single();

    if (error) throw error;
    
    toast.success('Document uploaded successfully');
    return data as KnowledgeBaseDocument;
  } catch (error) {
    console.error('Error uploading document:', error);
    toast.error('Failed to upload document');
    return null;
  }
};

/**
 * Get all documents for a project
 */
export const getProjectDocuments = async (projectId: string): Promise<KnowledgeBaseDocument[]> => {
  try {
    const { data, error } = await supabase
      .from('knowledge_base_documents')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as KnowledgeBaseDocument[] || [];
  } catch (error) {
    console.error('Error fetching project documents:', error);
    toast.error('Failed to fetch documents');
    return [];
  }
};

/**
 * Delete a document from the knowledge base
 */
export const deleteKnowledgeBaseDocument = async (documentId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('knowledge_base_documents')
      .delete()
      .eq('id', documentId);

    if (error) throw error;
    
    toast.success('Document deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    toast.error('Failed to delete document');
    return false;
  }
};
