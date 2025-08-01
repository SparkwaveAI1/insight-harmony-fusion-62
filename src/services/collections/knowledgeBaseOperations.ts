
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
  image_url?: string | null;
  image_data?: string | null;
  is_image?: boolean;
}

// 5MB file size limit
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

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
    console.log('Starting document upload for project:', projectId);
    
    // Get the user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to upload documents");
      return null;
    }

    // Check file size if a file is provided
    if (file && file.size > MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      toast.error(`File size (${fileSizeMB}MB) exceeds the 5MB limit. Please choose a smaller file.`);
      return null;
    }

    let fileUrl = null;
    let fileType = null;
    let fileSize = null;
    let imageUrl = null;
    let imageData = null;
    let isImage = false;

    // If a file is provided, upload it to storage
    if (file) {
      console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
      
      // Check if it's an image file
      isImage = file.type.startsWith('image/');
      
      // Create a unique filename with user ID and timestamp
      const fileExtension = file.name.split('.').pop();
      const fileName = `${user.id}/${projectId}/${Date.now()}-${file.name}`;
      
      console.log('Storage path:', fileName);
      
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('project-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        toast.error(`Failed to upload file: ${uploadError.message}`);
        return null;
      }

      console.log('File uploaded successfully:', fileData);

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('project-documents')
        .getPublicUrl(fileName);

      console.log('Public URL generated:', publicUrl);

      fileUrl = publicUrl;
      fileType = file.type;
      fileSize = file.size;

      // If it's an image, store the URL and base64 data for AI vision
      if (isImage) {
        imageUrl = publicUrl;
        
        // Convert image to base64 for AI analysis
        try {
          const reader = new FileReader();
          imageData = await new Promise<string>((resolve, reject) => {
            reader.onload = () => {
              const result = reader.result as string;
              // Remove the data URL prefix to get just the base64 data
              const base64 = result.split(',')[1];
              resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          console.log('Image converted to base64 for AI analysis');
        } catch (error) {
          console.error('Error converting image to base64:', error);
          // Continue without base64 data if conversion fails
        }
      }
    }

    // Insert the document record
    console.log('Inserting document record into database...');
    const { data, error } = await supabase
      .from('knowledge_base_documents')
      .insert({
        project_id: projectId,
        title,
        content,
        file_url: fileUrl,
        file_type: fileType,
        file_size: fileSize,
        uploaded_by: user.id,
        image_url: imageUrl,
        image_data: imageData,
        is_image: isImage
      })
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error);
      throw error;
    }
    
    console.log('Document record created:', data);
    toast.success('Document uploaded successfully');
    return data as KnowledgeBaseDocument;
  } catch (error) {
    console.error('Error uploading document:', error);
    toast.error(`Failed to upload document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
};

/**
 * Get all documents for a project
 */
export const getProjectDocuments = async (projectId: string): Promise<KnowledgeBaseDocument[]> => {
  try {
    console.log('Fetching documents for project:', projectId);
    
    const { data, error } = await supabase
      .from('knowledge_base_documents')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
    
    console.log('Documents fetched:', data?.length || 0);
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
    console.log('Deleting document:', documentId);
    
    // First get the document to check if it has a file
    const { data: document } = await supabase
      .from('knowledge_base_documents')
      .select('file_url')
      .eq('id', documentId)
      .single();

    // Delete the file from storage if it exists
    if (document?.file_url) {
      try {
        // Extract the file path from the URL
        const url = new URL(document.file_url);
        const pathParts = url.pathname.split('/');
        const filePath = pathParts.slice(-3).join('/'); // Get user_id/project_id/filename
        
        console.log('Deleting file from storage:', filePath);
        const { error: storageError } = await supabase.storage
          .from('project-documents')
          .remove([filePath]);
          
        if (storageError) {
          console.error('Error deleting file from storage:', storageError);
        }
      } catch (storageError) {
        console.error('Error parsing file URL or deleting from storage:', storageError);
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete the database record
    const { error } = await supabase
      .from('knowledge_base_documents')
      .delete()
      .eq('id', documentId);

    if (error) {
      console.error('Database delete error:', error);
      throw error;
    }
    
    console.log('Document deleted successfully');
    toast.success('Document deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    toast.error('Failed to delete document');
    return false;
  }
};
