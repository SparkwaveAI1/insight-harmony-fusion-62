-- Add conversation_summary column back to v4_personas table
ALTER TABLE public.v4_personas 
ADD COLUMN conversation_summary JSONB;

-- Create function to extract conversation summary from full_profile
CREATE OR REPLACE FUNCTION extract_conversation_summary(full_profile_data JSONB)
RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object(
    'demographics', jsonb_build_object(
      'age', COALESCE(full_profile_data->'identity'->>'age', ''),
      'location', COALESCE(full_profile_data->'identity'->>'location', ''),
      'occupation', COALESCE(full_profile_data->'identity'->>'occupation', ''),
      'name', COALESCE(full_profile_data->'identity'->>'name', ''),
      'background_description', COALESCE(full_profile_data->'identity'->>'background', '')
    ),
    'communication_style', jsonb_build_object(
      'directness', COALESCE(full_profile_data->'communication_style'->>'directness', ''),
      'formality', COALESCE(full_profile_data->'communication_style'->>'formality', ''),
      'response_patterns', COALESCE(full_profile_data->'communication_style'->>'response_patterns', '')
    ),
    'motivational_summary', COALESCE(full_profile_data->'motivation_profile'->>'primary_motivations', ''),
    'personality_summary', COALESCE(full_profile_data->'identity'->>'personality_overview', '')
  );
END;
$$ LANGUAGE plpgsql;

-- Populate conversation_summary for all existing personas
UPDATE public.v4_personas 
SET conversation_summary = extract_conversation_summary(full_profile)
WHERE conversation_summary IS NULL AND full_profile IS NOT NULL;