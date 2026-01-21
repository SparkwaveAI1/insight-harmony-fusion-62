-- Migration: create_tag_extraction_functions.sql
-- Step 3: Tag extraction functions for standardized filtering

-- Interest tags keyword mapping
CREATE OR REPLACE FUNCTION extract_interest_tags(
  p_full_profile jsonb,
  p_background text,
  p_conversation_summary jsonb
) RETURNS text[] AS $$
DECLARE
  searchable_text text;
  tags text[] := ARRAY[]::text[];
BEGIN
  -- Combine all searchable content
  searchable_text := LOWER(COALESCE(
    COALESCE(p_full_profile->>'attitude_narrative', '') || ' ' ||
    COALESCE(p_full_profile->>'political_narrative', '') || ' ' ||
    COALESCE(p_background, '') || ' ' ||
    COALESCE(p_conversation_summary->>'personality_summary', '') || ' ' ||
    COALESCE(p_conversation_summary->'demographics'->>'background_description', '') || ' ' ||
    COALESCE(p_full_profile->'daily_life'->>'screen_time_summary', '') || ' ' ||
    COALESCE(array_to_string(ARRAY(
      SELECT jsonb_array_elements_text(COALESCE(p_full_profile->'daily_life'->'mental_preoccupations', '[]'::jsonb))
    ), ' '), '') || ' ' ||
    COALESCE(array_to_string(ARRAY(
      SELECT jsonb_array_elements_text(COALESCE(p_full_profile->'relationships'->'friend_network'->'anchor_contexts', '[]'::jsonb))
    ), ' '), ''),
    ''
  ));

  -- Extract interest tags based on keywords
  IF searchable_text ~ '(cook|chef|culinary|recipe|baking|foodie|restaurant)' THEN tags := array_append(tags, 'cooking'); END IF;
  IF searchable_text ~ '(fitness|gym|workout|exercise|athletic|training|crossfit)' THEN tags := array_append(tags, 'fitness'); END IF;
  IF searchable_text ~ '(video game|gaming|gamer|esport|playstation|xbox|nintendo)' THEN tags := array_append(tags, 'gaming'); END IF;
  IF searchable_text ~ '(crypto|bitcoin|ethereum|blockchain|nft|defi)' THEN tags := array_append(tags, 'crypto'); END IF;
  IF searchable_text ~ '(travel|vacation|tourism|abroad|international|backpack)' THEN tags := array_append(tags, 'travel'); END IF;
  IF searchable_text ~ '(music|musician|concert|instrument|band|singing|guitar|piano)' THEN tags := array_append(tags, 'music'); END IF;
  IF searchable_text ~ '(art|artist|painting|sculpture|gallery|creative|drawing)' THEN tags := array_append(tags, 'art'); END IF;
  IF searchable_text ~ '(book|reading|literature|novel|author|library)' THEN tags := array_append(tags, 'reading'); END IF;
  IF searchable_text ~ '(garden|plant|horticulture|landscaping|botanical|flower)' THEN tags := array_append(tags, 'gardening'); END IF;
  IF searchable_text ~ '(pet|dog|cat|animal lover|veterinary|puppy|kitten)' THEN tags := array_append(tags, 'pets'); END IF;
  IF searchable_text ~ '(fashion|style|clothing|designer|apparel|wardrobe)' THEN tags := array_append(tags, 'fashion'); END IF;
  IF searchable_text ~ '(tech|gadget|software|hardware|innovation|startup|app)' THEN tags := array_append(tags, 'technology'); END IF;
  IF searchable_text ~ '(invest|stock|portfolio|trading|finance|wealth|401k)' THEN tags := array_append(tags, 'investing'); END IF;
  IF searchable_text ~ '(politic|activism|policy|election|civic|vote|campaign)' THEN tags := array_append(tags, 'politics'); END IF;
  IF searchable_text ~ '(spiritual|meditation|mindfulness|yoga|zen|prayer)' THEN tags := array_append(tags, 'spirituality'); END IF;
  IF searchable_text ~ '(sport|football|basketball|baseball|soccer|hockey|tennis|golf)' THEN tags := array_append(tags, 'sports'); END IF;
  IF searchable_text ~ '(outdoor|hiking|camping|fishing|hunting|nature|trail)' THEN tags := array_append(tags, 'outdoors'); END IF;
  IF searchable_text ~ '(photography|photo|camera|portrait|landscape)' THEN tags := array_append(tags, 'photography'); END IF;
  IF searchable_text ~ '(diy|woodwork|crafts|handmade|maker|building)' THEN tags := array_append(tags, 'diy'); END IF;
  IF searchable_text ~ '(wine|beer|cocktail|brewing|sommelier|whiskey)' THEN tags := array_append(tags, 'beverages'); END IF;
  IF searchable_text ~ '(movie|film|cinema|netflix|streaming|tv show|series)' THEN tags := array_append(tags, 'entertainment'); END IF;
  IF searchable_text ~ '(car|automotive|vehicle|driving|motorcycle|racing)' THEN tags := array_append(tags, 'automotive'); END IF;
  IF searchable_text ~ '(real estate|property|housing|mortgage|landlord|rental)' THEN tags := array_append(tags, 'real_estate'); END IF;
  IF searchable_text ~ '(parenting|child|kid|family|motherhood|fatherhood)' THEN tags := array_append(tags, 'parenting'); END IF;
  IF searchable_text ~ '(volunteer|charity|nonprofit|community service|giving back)' THEN tags := array_append(tags, 'volunteering'); END IF;

  RETURN tags;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- Health tags keyword mapping
CREATE OR REPLACE FUNCTION extract_health_tags(
  p_full_profile jsonb,
  p_background text,
  p_conversation_summary jsonb
) RETURNS text[] AS $$
DECLARE
  searchable_text text;
  health_text text;
  tags text[] := ARRAY[]::text[];
BEGIN
  -- Combine health-specific content
  health_text := LOWER(COALESCE(
    COALESCE(p_full_profile->'health_profile'->>'diet_pattern', '') || ' ' ||
    COALESCE(p_full_profile->'health_profile'->>'fitness_level', '') || ' ' ||
    COALESCE(array_to_string(ARRAY(
      SELECT jsonb_array_elements_text(COALESCE(p_full_profile->'health_profile'->'chronic_conditions', '[]'::jsonb))
    ), ' '), '') || ' ' ||
    COALESCE(array_to_string(ARRAY(
      SELECT jsonb_array_elements_text(COALESCE(p_full_profile->'health_profile'->'medications', '[]'::jsonb))
    ), ' '), '') || ' ' ||
    COALESCE(array_to_string(ARRAY(
      SELECT jsonb_array_elements_text(COALESCE(p_full_profile->'health_profile'->'mental_health_flags', '[]'::jsonb))
    ), ' '), ''),
    ''
  ));

  -- Also search general content
  searchable_text := LOWER(COALESCE(
    p_background || ' ' ||
    COALESCE(p_conversation_summary->>'personality_summary', ''),
    ''
  ));

  -- Combine both
  searchable_text := health_text || ' ' || searchable_text;

  -- Extract health tags
  IF searchable_text ~ '(anxiety|anxious|panic|nervous|worry|gad)' THEN tags := array_append(tags, 'anxiety'); END IF;
  IF searchable_text ~ '(depress|depression|depressed|sad|hopeless)' THEN tags := array_append(tags, 'depression'); END IF;
  IF searchable_text ~ '(diabetes|diabetic|blood sugar|insulin|a1c)' THEN tags := array_append(tags, 'diabetes'); END IF;
  IF searchable_text ~ '(obese|obesity|overweight|weight loss|bmi)' THEN tags := array_append(tags, 'obesity'); END IF;
  IF searchable_text ~ '(chronic pain|fibromyalgia|pain management|back pain)' THEN tags := array_append(tags, 'chronic_pain'); END IF;
  IF searchable_text ~ '(heart|cardiac|cardiovascular|blood pressure|hypertension|cholesterol)' THEN tags := array_append(tags, 'heart_condition'); END IF;
  IF searchable_text ~ '(cancer|oncology|tumor|chemotherapy|remission)' THEN tags := array_append(tags, 'cancer'); END IF;
  IF searchable_text ~ '(autoimmune|lupus|rheumatoid|crohn|celiac|multiple sclerosis)' THEN tags := array_append(tags, 'autoimmune'); END IF;
  IF searchable_text ~ '(allergy|allergic|intolerance|anaphylaxis)' THEN tags := array_append(tags, 'allergies'); END IF;
  IF searchable_text ~ '(insomnia|sleep apnea|sleep disorder|sleepless)' THEN tags := array_append(tags, 'sleep_issues'); END IF;
  IF searchable_text ~ '(asthma|respiratory|breathing|copd|lung)' THEN tags := array_append(tags, 'respiratory'); END IF;
  IF searchable_text ~ '(arthritis|joint pain|osteo|rheumat)' THEN tags := array_append(tags, 'arthritis'); END IF;
  IF searchable_text ~ '(migraine|headache|chronic headache)' THEN tags := array_append(tags, 'migraines'); END IF;
  IF searchable_text ~ '(adhd|attention deficit|add|hyperactiv)' THEN tags := array_append(tags, 'adhd'); END IF;
  IF searchable_text ~ '(thyroid|hypothyroid|hyperthyroid|hashimoto)' THEN tags := array_append(tags, 'thyroid'); END IF;
  IF searchable_text ~ '(ptsd|trauma|post.traumatic)' THEN tags := array_append(tags, 'ptsd'); END IF;
  IF searchable_text ~ '(eating disorder|anorex|bulimi|binge eating)' THEN tags := array_append(tags, 'eating_disorder'); END IF;
  IF searchable_text ~ '(addiction|substance|recovery|sober|alcoholi)' THEN tags := array_append(tags, 'addiction'); END IF;
  IF searchable_text ~ '(pregnant|pregnancy|expecting|prenatal)' THEN tags := array_append(tags, 'pregnancy'); END IF;
  IF searchable_text ~ '(menopause|perimenopause|hot flash)' THEN tags := array_append(tags, 'menopause'); END IF;

  RETURN tags;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- Work role tags keyword mapping
CREATE OR REPLACE FUNCTION extract_work_role_tags(
  p_occupation text,
  p_full_profile jsonb
) RETURNS text[] AS $$
DECLARE
  searchable_text text;
  tags text[] := ARRAY[]::text[];
BEGIN
  searchable_text := LOWER(COALESCE(p_occupation, '') || ' ' ||
    COALESCE(p_full_profile->'identity'->>'occupation', ''));

  -- Extract work role tags
  IF searchable_text ~ '(ceo|cfo|cto|coo|executive|c-suite|president|chief)' THEN tags := array_append(tags, 'executive'); END IF;
  IF searchable_text ~ '(manager|director|supervisor|team lead|head of)' THEN tags := array_append(tags, 'manager'); END IF;
  IF searchable_text ~ '(developer|programmer|engineer|coder|software)' THEN tags := array_append(tags, 'developer'); END IF;
  IF searchable_text ~ '(designer|ux|ui|creative director|graphic)' THEN tags := array_append(tags, 'designer'); END IF;
  IF searchable_text ~ '(nurse|doctor|physician|medical|healthcare|therapist|pharmacist)' THEN tags := array_append(tags, 'healthcare'); END IF;
  IF searchable_text ~ '(teacher|professor|educator|instructor|academic|tutor)' THEN tags := array_append(tags, 'educator'); END IF;
  IF searchable_text ~ '(sales|account executive|business development|rep)' THEN tags := array_append(tags, 'sales'); END IF;
  IF searchable_text ~ '(marketing|brand|advertising|pr|communications|social media)' THEN tags := array_append(tags, 'marketing'); END IF;
  IF searchable_text ~ '(accountant|financial analyst|banker|cpa|bookkeeper)' THEN tags := array_append(tags, 'finance'); END IF;
  IF searchable_text ~ '(lawyer|attorney|legal|paralegal|counsel|judge)' THEN tags := array_append(tags, 'legal'); END IF;
  IF searchable_text ~ '(entrepreneur|founder|startup|business owner|small business)' THEN tags := array_append(tags, 'entrepreneur'); END IF;
  IF searchable_text ~ '(freelance|consultant|contractor|self-employed|independent)' THEN tags := array_append(tags, 'freelancer'); END IF;
  IF searchable_text ~ '(retail|store|cashier|customer service|shop)' THEN tags := array_append(tags, 'retail'); END IF;
  IF searchable_text ~ '(construction|builder|contractor|tradesman|electrician|plumber)' THEN tags := array_append(tags, 'trades'); END IF;
  IF searchable_text ~ '(writer|author|journalist|editor|content|copywriter)' THEN tags := array_append(tags, 'writer'); END IF;
  IF searchable_text ~ '(data|analyst|analytics|scientist|research)' THEN tags := array_append(tags, 'analyst'); END IF;
  IF searchable_text ~ '(hr|human resources|recruiter|talent|people ops)' THEN tags := array_append(tags, 'hr'); END IF;
  IF searchable_text ~ '(admin|assistant|secretary|office manager|coordinator)' THEN tags := array_append(tags, 'administrative'); END IF;
  IF searchable_text ~ '(student|intern|graduate|undergrad)' THEN tags := array_append(tags, 'student'); END IF;
  IF searchable_text ~ '(retired|retiree|pension)' THEN tags := array_append(tags, 'retired'); END IF;
  IF searchable_text ~ '(stay.at.home|homemaker|full.time parent)' THEN tags := array_append(tags, 'homemaker'); END IF;

  RETURN tags;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
