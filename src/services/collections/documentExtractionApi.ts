
/**
 * API service for document text extraction
 */
export const extractDocumentText = async (fileData: string, fileType: string, fileName: string): Promise<string | null> => {
  try {
    const response = await fetch('/api/extract-document-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileData,
        fileType,
        fileName
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to extract document text');
    }

    const result = await response.json();
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
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase.functions.invoke('extract-image-text', {
      body: {
        imageData,
        fileName
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to extract image text');
    }

    return data?.extractedText || null;
  } catch (error) {
    console.error('Error in image text extraction API:', error);
    throw error;
  }
};
