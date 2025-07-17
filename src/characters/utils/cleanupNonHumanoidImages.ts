
import { supabase } from '@/integrations/supabase/client';

/**
 * Cleanup function to remove inappropriate human portrait URLs from non-humanoid characters
 * This should be run as part of system maintenance to clean up bad data
 */
export async function cleanupNonHumanoidCharacterImages(): Promise<void> {
  console.log('Starting cleanup of non-humanoid character images...');
  
  try {
    // Get all non-humanoid characters with profile images
    const { data: nonHumanoidChars, error: fetchError } = await supabase
      .from('non_humanoid_characters')
      .select('character_id, name, profile_image_url, species_type')
      .not('profile_image_url', 'is', null);
    
    if (fetchError) {
      console.error('Error fetching non-humanoid characters:', fetchError);
      return;
    }
    
    if (!nonHumanoidChars || nonHumanoidChars.length === 0) {
      console.log('No non-humanoid characters with images found');
      return;
    }
    
    console.log(`Found ${nonHumanoidChars.length} non-humanoid characters with images`);
    
    // Identify characters that likely have inappropriate human portraits
    // (This is a heuristic - in practice you might want to review these manually)
    const charactersToClean = nonHumanoidChars.filter(char => {
      // Look for URLs that might be human portraits from AI generation services
      const url = char.profile_image_url;
      if (!url) return false;
      
      // Check if it's likely a human portrait based on common patterns
      const hasHumanKeywords = /human|person|portrait|face|headshot/i.test(url);
      const isFromOldGeneration = url.includes('openai') || url.includes('dall-e');
      
      return hasHumanKeywords || isFromOldGeneration;
    });
    
    if (charactersToClean.length === 0) {
      console.log('No characters need image cleanup');
      return;
    }
    
    console.log(`Cleaning up images for ${charactersToClean.length} characters:`, 
      charactersToClean.map(c => c.name));
    
    // Clear the inappropriate image URLs
    for (const char of charactersToClean) {
      const { error: updateError } = await supabase
        .from('non_humanoid_characters')
        .update({ profile_image_url: null })
        .eq('character_id', char.character_id);
      
      if (updateError) {
        console.error(`Error cleaning up image for ${char.name}:`, updateError);
      } else {
        console.log(`Cleaned up inappropriate image for ${char.name} (${char.species_type})`);
      }
    }
    
    console.log('Image cleanup completed');
  } catch (error) {
    console.error('Error during image cleanup:', error);
  }
}

/**
 * Helper function to manually trigger cleanup from console
 * Usage: Call this from browser console if needed
 */
export async function triggerImageCleanup(): Promise<void> {
  console.log('Manually triggering image cleanup...');
  await cleanupNonHumanoidCharacterImages();
}
