
export const downloadPersonaAsJSON = (persona: any) => {
  // Export V2 persona with proper structure
  const personaData = {
    persona_id: persona.persona_id,
    id: persona.id,
    name: persona.name,
    description: persona.description,
    persona_data: persona.persona_data, // V2 PersonaV2 structure
    persona_type: persona.persona_type,
    is_public: persona.is_public,
    profile_image_url: persona.profile_image_url,
    voicepack_runtime: persona.voicepack_runtime,
    voicepack_hash: persona.voicepack_hash,
    user_id: persona.user_id,
    created_at: persona.created_at,
    updated_at: persona.updated_at
  };

  // Convert to formatted JSON
  const jsonString = JSON.stringify(personaData, null, 2);
  
  // Create blob and download
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // Create download link
  const link = document.createElement('a');
  link.href = url;
  link.download = `persona-v2-${persona.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${persona.persona_id}.json`;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
