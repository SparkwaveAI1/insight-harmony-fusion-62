
export const downloadImage = async (imageUrl: string, filename: string) => {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }
    
    // Get the blob
    const blob = await response.blob();
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
};

export const generateImageFilename = (characterName: string, imageId: string, createdAt: string): string => {
  const date = new Date(createdAt).toISOString().split('T')[0]; // YYYY-MM-DD format
  const cleanCharacterName = characterName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  return `${cleanCharacterName}_${date}_${imageId.slice(0, 8)}.png`;
};
