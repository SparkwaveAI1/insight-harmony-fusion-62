import { supabase } from '@/integrations/supabase/client';
import { PersonaV2Factory } from '@/services/persona/PersonaV2Factory';

/**
 * Migration script to populate existing personas with new builder outputs
 */
export async function migratePersonaData() {
  console.log('🔄 Starting persona data migration...');
  
  try {
    // Get all personas that need migration (missing new JSONB fields)
    const { data: personas, error } = await supabase
      .from('personas_v2')
      .select('*')
      .or('linguistic_style.is.null,trait_to_language_map.is.null,group_behavior.is.null,reasoning_modifiers.is.null,state_modifiers.is.null');
    
    if (error) {
      throw new Error(`Failed to fetch personas: ${error.message}`);
    }
    
    if (!personas || personas.length === 0) {
      console.log('✅ No personas need migration');
      return;
    }
    
    console.log(`📊 Found ${personas.length} personas to migrate`);
    
    // Process personas in batches of 5 to avoid overwhelming the system
    const batchSize = 5;
    for (let i = 0; i < personas.length; i += batchSize) {
      const batch = personas.slice(i, i + batchSize);
      console.log(`🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(personas.length / batchSize)}`);
      
      await Promise.all(batch.map(async (persona) => {
        try {
          console.log(`🔧 Migrating persona: ${persona.name} (${persona.persona_id})`);
          
          // Use PersonaV2Factory to generate the missing fields
          const factory = new PersonaV2Factory();
          const generationResult = await factory.generatePersonaV2({
            prompt: `Migrate existing persona: ${persona.name}`,
            seed: persona.persona_id
          });
          const updatedPersonaData = generationResult.persona;
          
          // Update the persona in the database with new builder outputs
          const { error: updateError } = await supabase
            .from('personas_v2')
            .update({
              persona_data: updatedPersonaData as any,
              linguistic_style: updatedPersonaData.linguistic_style,
              trait_to_language_map: updatedPersonaData.trait_to_language_map,
              group_behavior: updatedPersonaData.group_behavior,
              reasoning_modifiers: updatedPersonaData.reasoning_modifiers,
              state_modifiers: updatedPersonaData.state_modifiers,
              runtime_controls: updatedPersonaData.runtime_controls,
              validation_flags: generationResult.validation_flags,
              builder_metadata: generationResult.builder_metadata,
              updated_at: new Date().toISOString()
            })
            .eq('id', persona.id);
          
          if (updateError) {
            console.error(`❌ Failed to update persona ${persona.persona_id}:`, updateError);
          } else {
            console.log(`✅ Successfully migrated persona: ${persona.name}`);
          }
          
        } catch (error) {
          console.error(`❌ Error migrating persona ${persona.persona_id}:`, error);
        }
      }));
      
      // Brief pause between batches
      if (i + batchSize < personas.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('✅ Persona data migration completed');
    
    // Generate summary statistics
    const { data: updatedCount, error: countError } = await supabase
      .from('personas_v2')
      .select('id', { count: 'exact' })
      .not('linguistic_style', 'is', null);
    
    if (!countError) {
      console.log(`📊 Migration summary: ${updatedCount?.length || 0} personas now have complete builder data`);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

/**
 * Validate migration results
 */
export async function validateMigration() {
  console.log('🔍 Validating migration results...');
  
  try {
    // Check for personas with missing data
    const { data: incomplete, error } = await supabase
      .from('personas_v2')
      .select('persona_id, name')
      .or('linguistic_style.is.null,trait_to_language_map.is.null,group_behavior.is.null,reasoning_modifiers.is.null,state_modifiers.is.null');
    
    if (error) {
      throw new Error(`Validation query failed: ${error.message}`);
    }
    
    if (incomplete && incomplete.length > 0) {
      console.warn(`⚠️ Found ${incomplete.length} personas with incomplete data:`);
      incomplete.forEach(p => console.warn(`  - ${p.name} (${p.persona_id})`));
      return false;
    }
    
    // Check total count
    const { data: total, error: totalError } = await supabase
      .from('personas_v2')
      .select('id', { count: 'exact' });
    
    if (!totalError) {
      console.log(`✅ Validation passed: All ${total?.length || 0} personas have complete builder data`);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
    return false;
  }
}

/**
 * Run the complete migration process
 */
export async function runMigration() {
  try {
    await migratePersonaData();
    const isValid = await validateMigration();
    
    if (isValid) {
      console.log('🎉 Migration completed successfully!');
    } else {
      console.warn('⚠️ Migration completed with warnings. Check validation results.');
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  }
}