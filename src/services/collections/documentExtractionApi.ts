import { supabase } from "@/integrations/supabase/client";

/**
 * Get the current user's auth token for edge function calls.
 * Falls back to anon key behavior if no session (edge function handles it).
 */
async function getAuthHeader(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return `Bearer ${session.access_token}`;
  }
  // Fall back to anon key from env
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
  return `Bearer ${anonKey}`;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

/**
 * API service for document text extraction
 */
export const extractDocumentText = async (fileData: string, fileType: string, fileName: string): Promise<string | null> => {
  try {
    console.log('Extracting document text:', { fileType, fileName, dataLength: fileData.length });
    
    const authHeader = await getAuthHeader();
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/extract-document-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        fileData,
        fileType,
        fileName
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Document extraction API error:', response.status, errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || 'Failed to extract document text' };
      }
      
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Document extraction successful:', { extractedLength: result.extractedText?.length || 0 });
    return result.extractedText;
  } catch (error) {
    console.error('Error in document text extraction API:', error);
    throw error;
  }
};

/**
 * API service for image text extraction
 */
export const extractImageText = async (imageData: string, fileName: string): Promise<string | null> => {
  try {
    console.log('Extracting image text:', { fileName, dataLength: imageData.length });
    
    const authHeader = await getAuthHeader();
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/extract-image-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        imageData,
        fileName
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Image extraction API error:', response.status, errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || 'Failed to extract image text' };
      }
      
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Image extraction successful:', { extractedLength: result.extractedText?.length || 0 });
    return result.extractedText;
  } catch (error) {
    console.error('Error in image text extraction API:', error);
    throw error;
  }
};
