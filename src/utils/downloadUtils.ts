
export const downloadPersonaAsJSON = (persona: any) => {
  // Create a clean copy of the persona data
  const personaData = {
    persona_id: persona.persona_id,
    id: persona.id,
    name: persona.name,
    creation_date: persona.creation_date,
    created_at: persona.created_at,
    metadata: persona.metadata,
    trait_profile: persona.trait_profile,
    behavioral_modulation: persona.behavioral_modulation,
    linguistic_profile: persona.linguistic_profile,
    emotional_triggers: persona.emotional_triggers,
    interview_sections: persona.interview_sections,
    simulation_directives: persona.simulation_directives,
    preinterview_tags: persona.preinterview_tags,
    prompt: persona.prompt,
    user_id: persona.user_id,
    is_public: persona.is_public,
    profile_image_url: persona.profile_image_url,
    enhanced_metadata_version: persona.enhanced_metadata_version,
    persona_type: persona.persona_type,
    persona_context: persona.persona_context
  };

  // Convert to formatted JSON
  const jsonString = JSON.stringify(personaData, null, 2);
  
  // Create blob and download
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // Create download link
  const link = document.createElement('a');
  link.href = url;
  link.download = `persona-${persona.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${persona.persona_id}.json`;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
