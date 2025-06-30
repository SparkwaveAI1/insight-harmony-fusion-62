
import { supabase } from '@/integrations/supabase/client';
import { generateAppearancePrompt, generateAppearancePromptFromCreativeData } from '../services/appearancePromptGenerator';
import { Character } from '../types/characterTraitTypes';
import { NonHumanoidCharacter } from '../types/nonHumanoidTypes';

export const backfillAppearancePrompts = async (): Promise<void> => {
  console.log('Starting backfill of appearance prompts for existing creative characters...');
  
  try {
    // Backfill humanoid creative characters
    await backfillHumanoidCreativeCharacters();
    
    // Backfill non-humanoid creative characters
    await backfillNonHumanoidCreativeCharacters();
    
    console.log('✅ Backfill completed successfully');
  } catch (error) {
    console.error('❌ Error during backfill:', error);
    throw error;
  }
};

const backfillHumanoidCreativeCharacters = async (): Promise<void> => {
  console.log('Backfilling humanoid creative characters...');
  
  // Get humanoid creative characters without appearance prompts
  const { data: characters, error } = await supabase
    .from('characters')
    .select('*')
    .or('character_type.eq.fictional,metadata->>created_via.eq.creative_genesis')
    .is('appearance_prompt', null);
  
  if (error) {
    console.error('Error fetching humanoid characters:', error);
    throw error;
  }
  
  if (!characters || characters.length === 0) {
    console.log('No humanoid creative characters need backfilling');
    return;
  }
  
  console.log(`Found ${characters.length} humanoid creative characters to backfill`);
  
  for (const character of characters) {
    try {
      let appearancePrompt = '';
      
      // Cast metadata to any to access properties safely
      const metadata = character.metadata as any;
      
      // Try to generate from existing metadata
      if (metadata?.created_via === 'creative_genesis') {
        // This is a creative character, try to reconstruct the creative data
        const creativeData = {
          name: character.name,
          entityType: 'humanoid',
          environment: metadata?.environment || '',
          physicalAppearanceDescription: metadata?.physical_description || 
                                       character.physical_appearance?.description || 
                                       `${character.name}, a humanoid character`
        };
        
        appearancePrompt = generateAppearancePromptFromCreativeData(creativeData as any);
      } else {
        // Fallback for other fictional characters
        appearancePrompt = generateAppearancePrompt({
          name: character.name,
          entityType: 'humanoid',
          environment: metadata?.environment || character.region || '',
          physicalDescription: character.physical_appearance?.description || 
                             `${character.name}, a ${character.character_type} character`
        });
      }
      
      // Update the character with the generated appearance prompt
      const { error: updateError } = await supabase
        .from('characters')
        .update({ appearance_prompt: appearancePrompt })
        .eq('character_id', character.character_id);
      
      if (updateError) {
        console.error(`Error updating character ${character.name}:`, updateError);
      } else {
        console.log(`✅ Updated appearance prompt for ${character.name}`);
      }
    } catch (error) {
      console.error(`Error processing character ${character.name}:`, error);
    }
  }
};

const backfillNonHumanoidCreativeCharacters = async (): Promise<void> => {
  console.log('Backfilling non-humanoid creative characters...');
  
  // Get non-humanoid characters without appearance prompts
  const { data: characters, error } = await supabase
    .from('non_humanoid_characters')
    .select('*')
    .is('appearance_prompt', null);
  
  if (error) {
    console.error('Error fetching non-humanoid characters:', error);
    throw error;
  }
  
  if (!characters || characters.length === 0) {
    console.log('No non-humanoid characters need backfilling');
    return;
  }
  
  console.log(`Found ${characters.length} non-humanoid characters to backfill`);
  
  for (const character of characters) {
    try {
      // Cast metadata and trait_profile to any to access properties safely
      const metadata = character.metadata as any;
      const traitProfile = character.trait_profile as any;
      
      const appearancePrompt = generateAppearancePrompt({
        name: character.name,
        entityType: 'non-humanoid',
        environment: metadata?.environment || character.origin_universe || '',
        physicalManifestation: traitProfile?.physical_manifestation,
        speciesType: character.species_type,
        formFactor: character.form_factor
      });
      
      // Update the character with the generated appearance prompt
      const { error: updateError } = await supabase
        .from('non_humanoid_characters')
        .update({ appearance_prompt: appearancePrompt })
        .eq('character_id', character.character_id);
      
      if (updateError) {
        console.error(`Error updating character ${character.name}:`, updateError);
      } else {
        console.log(`✅ Updated appearance prompt for ${character.name}`);
      }
    } catch (error) {
      console.error(`Error processing character ${character.name}:`, error);
    }
  }
};

// Helper function to run backfill from console
export const runBackfillAppearancePrompts = async (): Promise<void> => {
  try {
    await backfillAppearancePrompts();
    console.log('Backfill completed! Check the console for details.');
  } catch (error) {
    console.error('Backfill failed:', error);
  }
};

// Make it available globally for easy access from browser console
if (typeof window !== 'undefined') {
  (window as any).runBackfillAppearancePrompts = runBackfillAppearancePrompts;
}
