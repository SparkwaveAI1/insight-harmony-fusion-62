-- Drop existing function if any partial creation happened
DROP FUNCTION IF EXISTS extract_persona_tags() CASCADE;

-- Function to extract tags from full_profile JSON
CREATE OR REPLACE FUNCTION extract_persona_tags()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_interests text[];
  v_health text[];
  v_work_roles text[];
  v_industries text[];
  v_occupation text;
BEGIN
  v_occupation := COALESCE(NEW.full_profile->'identity'->>'occupation', '');

  -- Extract interest tags from daily_life.primary_activities keys and motivation labels
  SELECT ARRAY_AGG(DISTINCT val) INTO v_interests
  FROM (
    SELECT jsonb_object_keys(COALESCE(NEW.full_profile->'daily_life'->'primary_activities', '{}'::jsonb)) AS val
    UNION ALL
    SELECT jsonb_array_elements_text(COALESCE(NEW.full_profile->'motivation_profile'->'primary_motivation_labels', '[]'::jsonb))
  ) t
  WHERE val IS NOT NULL AND val != '';
  
  -- Extract health tags from health_profile
  SELECT ARRAY_AGG(DISTINCT val) INTO v_health
  FROM (
    SELECT jsonb_array_elements_text(COALESCE(NEW.full_profile->'health_profile'->'chronic_conditions', '[]'::jsonb)) AS val
    UNION ALL
    SELECT jsonb_array_elements_text(COALESCE(NEW.full_profile->'health_profile'->'mental_health_flags', '[]'::jsonb))
    UNION ALL
    SELECT NEW.full_profile->'health_profile'->>'bmi_category'
    UNION ALL
    SELECT NEW.full_profile->'health_profile'->>'diet_pattern'
  ) t
  WHERE val IS NOT NULL AND val != '';
  
  -- Extract work role tags (just occupation for now)
  SELECT ARRAY_AGG(DISTINCT val) INTO v_work_roles
  FROM (
    SELECT v_occupation AS val WHERE v_occupation != ''
  ) t
  WHERE val IS NOT NULL AND val != '';
  
  -- Extract industry from occupation keywords
  v_industries := CASE 
    WHEN v_occupation ILIKE '%tech%' OR v_occupation ILIKE '%software%' OR v_occupation ILIKE '%developer%' OR v_occupation ILIKE '%engineer%' THEN ARRAY['technology']
    WHEN v_occupation ILIKE '%health%' OR v_occupation ILIKE '%medical%' OR v_occupation ILIKE '%nurse%' OR v_occupation ILIKE '%doctor%' OR v_occupation ILIKE '%physician%' THEN ARRAY['healthcare']
    WHEN v_occupation ILIKE '%financ%' OR v_occupation ILIKE '%bank%' OR v_occupation ILIKE '%account%' OR v_occupation ILIKE '%invest%' THEN ARRAY['finance']
    WHEN v_occupation ILIKE '%teach%' OR v_occupation ILIKE '%professor%' OR v_occupation ILIKE '%education%' OR v_occupation ILIKE '%school%' THEN ARRAY['education']
    WHEN v_occupation ILIKE '%retail%' OR v_occupation ILIKE '%sales%' OR v_occupation ILIKE '%store%' OR v_occupation ILIKE '%shop%' THEN ARRAY['retail']
    WHEN v_occupation ILIKE '%construct%' OR v_occupation ILIKE '%build%' OR v_occupation ILIKE '%architect%' THEN ARRAY['construction']
    WHEN v_occupation ILIKE '%market%' OR v_occupation ILIKE '%advertis%' OR v_occupation ILIKE '%brand%' THEN ARRAY['marketing']
    WHEN v_occupation ILIKE '%legal%' OR v_occupation ILIKE '%lawyer%' OR v_occupation ILIKE '%attorney%' THEN ARRAY['legal']
    WHEN v_occupation ILIKE '%restaurant%' OR v_occupation ILIKE '%chef%' OR v_occupation ILIKE '%food%' OR v_occupation ILIKE '%hospitality%' THEN ARRAY['hospitality']
    WHEN v_occupation ILIKE '%transport%' OR v_occupation ILIKE '%logistics%' OR v_occupation ILIKE '%driver%' OR v_occupation ILIKE '%trucking%' THEN ARRAY['transportation']
    ELSE ARRAY[]::text[]
  END;

  -- Update the tag columns
  NEW.interest_tags := COALESCE(v_interests, ARRAY[]::text[]);
  NEW.health_tags := COALESCE(v_health, ARRAY[]::text[]);
  NEW.work_role_tags := COALESCE(v_work_roles, ARRAY[]::text[]);
  NEW.industry_tags := COALESCE(v_industries, ARRAY[]::text[]);
  
  RETURN NEW;
END;
$$;

-- Create trigger on v4_personas
DROP TRIGGER IF EXISTS trigger_extract_persona_tags ON v4_personas;
CREATE TRIGGER trigger_extract_persona_tags
  BEFORE INSERT OR UPDATE OF full_profile ON v4_personas
  FOR EACH ROW
  EXECUTE FUNCTION extract_persona_tags();