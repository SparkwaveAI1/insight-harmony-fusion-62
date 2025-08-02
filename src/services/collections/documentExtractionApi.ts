
/**
 * API service for document text extraction
 */
export const extractDocumentText = async (fileData: string, fileType: string, fileName: string): Promise<string | null> => {
  try {
    console.log('Extracting document text:', { fileType, fileName, dataLength: fileData.length });
    
    const response = await fetch('https://wgerdrdsuusnrdnwwelt.supabase.co/functions/v1/extract-document-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZXJkcmRzdXVzbnJkbnd3ZWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxODkxMjAsImV4cCI6MjA1Nzc2NTEyMH0.yAoqtSbNo7gabNOSyDrNGNjIUaMIPwyhevV2F-IQHbY`
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
    
    const response = await fetch('https://wgerdrdsuusnrdnwwelt.supabase.co/functions/v1/extract-image-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZXJkcmRzdXVzbnJkbnd3ZWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxODkxMjAsImV4cCI6MjA1Nzc2NTEyMH0.yAoqtSbNo7gabNOSyDrNGNjIUaMIPwyhevV2F-IQHbY`
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
