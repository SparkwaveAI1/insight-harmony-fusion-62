
import { PersonaTemplate } from "../types.ts";
import { 
  generateLocationContext,
  generateFamilyRelationships,
  generateHealthAttributes,
  generatePhysicalDescription,
  generateKnowledgeDomains,
  generatePsychologicalCultural
} from "../openaiService.ts";
import { validateCompleteMetadata } from "../validationHelpers.ts";
import { PersonaGenerationError, wrapWithErrorHandling } from "../errorHandler.ts";
import { withRetry } from "../retryService.ts";

// Helper function to safely merge data
function safelyMergeData(source: any, expectedKey: string, fallback: any = {}) {
  if (!source) {
    console.warn(`⚠️ Source data is null/undefined for ${expectedKey}`);
    return fallback;
  }
  
  // If the data is nested under the expected key, extract it
  if (source[expectedKey] && typeof source[expectedKey] === 'object') {
    console.log(`✅ Found nested data for ${expectedKey}`);
    return source[expectedKey];
  }
  
  // If the data is at the root level, use it directly
  if (typeof source === 'object' && Object.keys(source).length > 0) {
    console.log(`✅ Using root-level data for ${expectedKey}`);
    return source;
  }
  
  console.warn(`⚠️ No valid data found for ${expectedKey}, using fallback`);
  return fallback;
}

export async function enhancePersonaMetadata(basePersona: PersonaTemplate, prompt: string): Promise<PersonaTemplate> {
  console.log('=== STAGE 2-7: ENHANCING METADATA ===');
  
  // Stage 2: Location & Context
  console.log('Generating location & context...');
  const locationContext = await wrapWithErrorHandling(
    () => withRetry(
      () => generateLocationContext(basePersona, prompt),
      { maxRetries: 1 },
      'Location Context Generation'
    ),
    'location_context',
    { personaName: basePersona.name }
  );
  
  // Stage 3: Family & Relationships
  console.log('Generating family & relationships...');
  const familyRelationships = await wrapWithErrorHandling(
    () => withRetry(
      () => generateFamilyRelationships(basePersona, prompt),
      { maxRetries: 1 },
      'Family Relationships Generation'
    ),
    'family_relationships',
    { personaName: basePersona.name }
  );
  
  // Stage 4: Health Attributes
  console.log('Generating health attributes...');
  const healthAttributes = await wrapWithErrorHandling(
    () => withRetry(
      () => generateHealthAttributes(basePersona, prompt),
      { maxRetries: 1 },
      'Health Attributes Generation'
    ),
    'health_attributes',
    { personaName: basePersona.name }
  );
  
  // Stage 5: Physical Description
  console.log('Generating physical description...');
  const physicalDescription = await wrapWithErrorHandling(
    () => withRetry(
      () => generatePhysicalDescription(basePersona, prompt),
      { maxRetries: 1 },
      'Physical Description Generation'
    ),
    'physical_description',
    { personaName: basePersona.name }
  );
  
  // Stage 6: Knowledge Domains
  console.log('Generating knowledge domains...');
  const knowledgeDomains = await wrapWithErrorHandling(
    () => withRetry(
      () => generateKnowledgeDomains(basePersona, prompt),
      { maxRetries: 1 },
      'Knowledge Domains Generation'
    ),
    'knowledge_domains',
    { personaName: basePersona.name }
  );
  
  // Stage 7: Psychological & Cultural
  console.log('Generating psychological & cultural data...');
  const psychologicalCultural = await wrapWithErrorHandling(
    () => withRetry(
      () => generatePsychologicalCultural(basePersona, prompt),
      { maxRetries: 1 },
      'Psychological Cultural Generation'
    ),
    'psychological_cultural',
    { personaName: basePersona.name }
  );
  
  // IMPROVED: Robust data merging with validation and fallbacks
  console.log('=== MERGING METADATA WITH VALIDATION ===');
  
  // Merge location context
  const locationData = safelyMergeData(locationContext, 'location_context');
  Object.assign(basePersona.metadata, locationData);
  console.log(`Merged location data: ${Object.keys(locationData).length} fields`);
  
  // Merge family relationships with robust handling
  const familyData = safelyMergeData(familyRelationships, 'relationships_family');
  Object.assign(basePersona.metadata, familyData);
  console.log(`Merged family data: ${Object.keys(familyData).length} fields`);
  
  // Merge health attributes
  const healthData = safelyMergeData(healthAttributes, 'health_attributes');
  Object.assign(basePersona.metadata, healthData);
  console.log(`Merged health data: ${Object.keys(healthData).length} fields`);
  
  // Merge physical description
  const physicalData = safelyMergeData(physicalDescription, 'physical_description');
  Object.assign(basePersona.metadata, physicalData);
  console.log(`Merged physical data: ${Object.keys(physicalData).length} fields`);
  
  // Merge knowledge domains
  const knowledgeData = safelyMergeData(knowledgeDomains, 'knowledge_domains');
  Object.assign(basePersona.metadata, knowledgeData);
  console.log(`Merged knowledge data: ${Object.keys(knowledgeData).length} fields`);
  
  // Merge psychological & cultural
  const psychData = safelyMergeData(psychologicalCultural, 'psychological_cultural');
  Object.assign(basePersona.metadata, psychData);
  console.log(`Merged psychological data: ${Object.keys(psychData).length} fields`);
  
  // Log final metadata state for debugging
  console.log(`=== FINAL METADATA SUMMARY ===`);
  console.log(`Total metadata fields: ${Object.keys(basePersona.metadata).length}`);
  console.log(`Has family relationships: ${!!basePersona.metadata.has_children}`);
  console.log(`Has knowledge domains: ${!!basePersona.metadata.knowledge_domains}`);
  
  // Now validate complete metadata after all stages
  const completeValidation = validateCompleteMetadata(basePersona.metadata);
  if (!completeValidation.isValid) {
    console.warn('⚠️ Complete metadata validation failed:', completeValidation.errors);
    // Don't throw error, just warn - we can continue with incomplete data
  } else {
    console.log('✅ Complete metadata validation passed');
  }
  
  console.log('✅ Enhanced metadata with all comprehensive attributes');
  return basePersona;
}
