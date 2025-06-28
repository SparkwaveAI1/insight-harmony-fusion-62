import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CharacterTraitRequest {
  name: string;
  age: number;
  gender: string;
  social_class: string;
  region: string;
  occupation?: string;
  personality_traits?: string;
  backstory?: string;
  historical_context?: string;
  date_of_birth?: string;
  ethnicity?: string;
  description?: string;
  primary_description?: string;
  historical_date?: string;
  generation_type?: string;
  character_type?: string;
  // Creative character specific fields
  genre?: string;
  species?: string;
  universe?: string;
  magical_abilities?: string;
  technological_augmentations?: string;
  power_level?: string;
  faction_allegiance?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const characterData: CharacterTraitRequest = await req.json();
    console.log('🎯 Processing character generation request:', characterData.name);
    console.log('📝 Character type:', characterData.character_type || 'historical');

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Build prompt based on character type
    const prompt = characterData.character_type === 'creative' 
      ? buildCreativeCharacterPrompt(characterData)
      : buildComprehensiveCharacterPrompt(characterData);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: characterData.character_type === 'creative' 
              ? 'You are an expert in creative writing, fantasy/sci-fi world-building, and character development. Generate comprehensive character profiles for creative characters from any genre, species, or universe, ensuring internal consistency within their fictional world.'
              : 'You are an expert in historical psychology, anthropology, and personality assessment. Generate comprehensive character profiles from detailed descriptions, paying careful attention to historical context, cultural background, and specific traits mentioned.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: characterData.character_type === 'creative' ? 0.8 : 0.7, // Higher creativity for creative characters
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const traitAnalysis = data.choices[0].message.content;

    // Parse the AI response and convert to structured trait profile
    const traitProfile = characterData.character_type === 'creative'
      ? parseCreativeTraitResponse(traitAnalysis, characterData)
      : parseComprehensiveTraitResponse(traitAnalysis, characterData);

    console.log('✅ Generated comprehensive trait profile for', characterData.name);
    console.log('🔍 Character type:', characterData.character_type || 'historical');
    console.log('📊 Extracted traits:', Object.keys(traitProfile));
    
    return new Response(JSON.stringify({ traitProfile }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error generating character traits:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function buildCreativeCharacterPrompt(character: CharacterTraitRequest): string {
  const description = character.primary_description || character.description;
  
  return `
Analyze this creative character description and generate a comprehensive personality and world-specific profile:

**Creative Character Description:**
${description || 'No detailed description provided'}

**Creative Character Information:**
- Name: ${character.name}
- Genre: ${character.genre || 'To be determined from description'}
- Species: ${character.species || 'To be determined from description'}
- Universe/World: ${character.universe || 'To be determined from description'}
- Magical Abilities: ${character.magical_abilities || 'To be determined from description'}
- Technological Augmentations: ${character.technological_augmentations || 'To be determined from description'}
- Power Level: ${character.power_level || 'To be determined from description'}
- Faction/Allegiance: ${character.faction_allegiance || 'To be determined from description'}

**CRITICAL INSTRUCTIONS:**
1. Extract species, genre, universe, and abilities DIRECTLY from the description
2. Create traits that are consistent with the fictional world and genre
3. Generate abilities and powers that fit the character's world and species
4. Pay attention to the power level and ensure abilities match that scale
5. Create appropriate social structures and relationships for the fictional universe
6. Ensure internal consistency within the character's fictional world

Generate a comprehensive profile in this JSON format:
{
  "gender": "extracted from description",
  "ethnicity": "species/race from description", 
  "social_class": "social standing within their world",
  "occupation": "role/profession in their universe",
  "genre": "specific genre from description",
  "species": "species/race from description",
  "universe": "world/universe from description",
  "power_level": "character's power/skill level",
  "magical_abilities": "magical powers if applicable",
  "technological_augmentations": "tech enhancements if applicable",
  "faction_allegiance": "group/organization loyalty",
  "cultural_context": "fictional world cultural background",
  "region": "location within their world",
  "urban_rural_context": "living environment type in their world",
  "education_level": "knowledge/training level appropriate for world",
  "physical_appearance": {
    "height_build": "physical description fitting species",
    "hair": "hair appropriate for species/world",
    "eye_color": "eye color fitting species",
    "skin_tone": "skin/surface appropriate for species",
    "ethnicity": "species/racial background",
    "species_traits": "unique physical traits of the species"
  },
  "personality_traits": "detailed personality from description",
  "backstory": "comprehensive background story within their world",
  "appearance": "full physical appearance description",
  "world_context": "detailed world/universe context and lore",
  "relationships_family": {
    "marital_status": "appropriate for species/culture/world",
    "has_children": "boolean based on context",  
    "family_relationship_quality": "relationship dynamics in their world",
    "living_situation": "household arrangement in their universe",
    "support_system_strength": "community connections in their world"
  },
  "abilities_powers": {
    "magical_abilities": "detailed magical powers if applicable",
    "technological_abilities": "tech skills/augmentations if applicable", 
    "natural_abilities": "innate species abilities",
    "trained_abilities": "learned skills and talents",
    "power_limitations": "constraints or weaknesses"
  },
  "big_five": {
    "openness": 0.0-1.0,
    "conscientiousness": 0.0-1.0,
    "extraversion": 0.0-1.0,
    "agreeableness": 0.0-1.0,
    "neuroticism": 0.0-1.0
  },
  "moral_foundations": {
    "care": 0.0-1.0,
    "fairness": 0.0-1.0,
    "loyalty": 0.0-1.0,
    "authority": 0.0-1.0,
    "sanctity": 0.0-1.0,
    "liberty": 0.0-1.0
  },
  "world_values": {
    "traditional_vs_secular": 0.0-1.0,
    "survival_vs_self_expression": 0.0-1.0,
    "materialist_vs_postmaterialist": 0.0-1.0
  },
  "political_compass": {
    "economic": -1.0 to 1.0,
    "authoritarian_libertarian": -1.0 to 1.0,
    "cultural_conservative_progressive": -1.0 to 1.0,
    "political_salience": 0.0-1.0
  },
  "behavioral_economics": {
    "present_bias": 0.0-1.0,
    "loss_aversion": 0.0-1.0,
    "overconfidence": 0.0-1.0,
    "risk_sensitivity": 0.0-1.0,
    "scarcity_sensitivity": 0.0-1.0
  },
  "cultural_dimensions": {
    "power_distance": 0.0-1.0,
    "individualism_vs_collectivism": 0.0-1.0,
    "masculinity_vs_femininity": 0.0-1.0,
    "uncertainty_avoidance": 0.0-1.0,
    "long_term_orientation": 0.0-1.0,
    "indulgence_vs_restraint": 0.0-1.0
  }
}

Extract ALL information from the detailed description. Create a character that feels authentic to their fictional world and genre.
`;
}

function parseCreativeTraitResponse(response: string, character: CharacterTraitRequest): any {
  try {
    // Extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log('⚠️ No JSON found in AI response, using creative fallback parsing');
      return buildCreativeFallbackFromDescription(character);
    }

    const parsedTraits = JSON.parse(jsonMatch[0]);
    console.log('✅ Successfully parsed AI-generated creative traits');
    
    // Build complete creative trait profile
    return {
      // Core demographics for creative characters
      gender: parsedTraits.gender || character.gender || 'not specified',
      ethnicity: parsedTraits.species || character.species || 'not specified',
      race_ethnicity: parsedTraits.species || character.species || 'not specified',
      social_class: parsedTraits.social_class || 'not specified',
      social_class_identity: parsedTraits.social_class || 'not specified',
      occupation: parsedTraits.occupation || 'not specified',
      genre: parsedTraits.genre || character.genre || 'not specified',
      species: parsedTraits.species || character.species || 'not specified',
      universe: parsedTraits.universe || character.universe || 'not specified',
      region: parsedTraits.region || character.universe || 'not specified',
      
      // Creative-specific context
      power_level: parsedTraits.power_level || character.power_level || 'not specified',
      magical_abilities: parsedTraits.magical_abilities || character.magical_abilities || 'none',
      technological_augmentations: parsedTraits.technological_abilities || character.technological_augmentations || 'none',
      faction_allegiance: parsedTraits.faction_allegiance || character.faction_allegiance || 'none',
      
      // World and cultural context
      cultural_context: parsedTraits.cultural_context || `${character.genre} character from ${character.universe}`,
      cultural_background: parsedTraits.species || character.species || 'not specified',
      urban_rural_context: parsedTraits.urban_rural_context || 'varies by world',
      education_level: parsedTraits.education_level || 'appropriate for world',
      
      // Physical appearance with species considerations
      physical_appearance: {
        height_build: parsedTraits.physical_appearance?.height_build || 'appropriate for species',
        hair: parsedTraits.physical_appearance?.hair || 'appropriate for species',
        eye_color: parsedTraits.physical_appearance?.eye_color || 'appropriate for species', 
        skin_tone: parsedTraits.physical_appearance?.skin_tone || 'appropriate for species',
        ethnicity: parsedTraits.physical_appearance?.ethnicity || parsedTraits.species || 'not specified',
        species_traits: parsedTraits.physical_appearance?.species_traits || 'unique to species',
      },
      
      // Abilities and powers system
      abilities_powers: parsedTraits.abilities_powers || {
        magical_abilities: character.magical_abilities || 'none',
        technological_abilities: character.technological_augmentations || 'none',
        natural_abilities: 'species-appropriate abilities',
        trained_abilities: 'learned skills',
        power_limitations: 'balanced constraints'
      },
      
      // Relationships within fictional world
      relationships_family: parsedTraits.relationships_family || {
        marital_status: 'appropriate for world/species culture',
        has_children: false,
        family_relationship_quality: 'good',
        living_situation: 'appropriate for world',
        support_system_strength: 'strong bonds within world'
      },
      
      // Character development
      personality_traits: parsedTraits.personality_traits || character.personality_traits || 'extracted from description',
      backstory: parsedTraits.backstory || character.backstory || 'developed from description',
      appearance: parsedTraits.appearance || 'detailed species-appropriate appearance',
      world_context: parsedTraits.world_context || character.historical_context || `Rich ${character.genre} world context`,
      
      // Psychological trait scores adapted for creative characters
      big_five: parsedTraits.big_five || getCreativeDefaults(character).big_five,
      moral_foundations: parsedTraits.moral_foundations || getCreativeDefaults(character).moral_foundations,
      world_values: parsedTraits.world_values || getCreativeDefaults(character).world_values,
      political_compass: {
        ...parsedTraits.political_compass,
        group_fusion_level: 0.6,
        outgroup_threat_sensitivity: 0.4,
        commons_orientation: 0.7,
        political_motivations: {
          material_interest: 0.5,
          moral_vision: 0.6,
          cultural_preservation: 0.7,
          status_reordering: 0.3,
        },
      },
      behavioral_economics: parsedTraits.behavioral_economics || getCreativeDefaults(character).behavioral_economics,
      cultural_dimensions: parsedTraits.cultural_dimensions || getCreativeDefaults(character).cultural_dimensions,
      
      // Extended trait system
      social_identity: {
        identity_strength: 0.7,
        identity_complexity: 0.6,
        ingroup_bias_tendency: 0.5,
        outgroup_bias_tendency: 0.4,
        social_dominance_orientation: 0.4,
        system_justification: 0.5,
        intergroup_contact_comfort: 0.6,
        cultural_intelligence: 0.7,
      },
      extended_traits: {
        truth_orientation: 0.7,
        moral_consistency: 0.6,
        self_awareness: 0.6,
        empathy: 0.6,
        self_efficacy: 0.7,
        manipulativeness: 0.3,
        impulse_control: 0.6,
        shadow_trait_activation: 0.4,
        attention_pattern: 0.6,
        cognitive_load_resilience: 0.6,
        institutional_trust: 0.6,
        conformity_tendency: 0.4,
        conflict_avoidance: 0.4,
        cognitive_flexibility: 0.7,
        need_for_cognitive_closure: 0.4,
        emotional_intensity: 0.6,
        emotional_regulation: 0.6,
        trigger_sensitivity: 0.4,
      },
      dynamic_state: {
        current_stress_level: 0.3,
        emotional_stability_context: 0.6,
        motivation_orientation: 0.7,
        trust_volatility: 0.4,
        trigger_threshold: 0.5,
      },
      physical_health: {
        disabilities: [],
        health_conditions: [],
        mobility: 'species-appropriate',
      },
    };
  } catch (error) {
    console.error('❌ Error parsing AI creative trait response:', error);
    return buildCreativeFallbackFromDescription(character);
  }
}

function buildCreativeFallbackFromDescription(character: CharacterTraitRequest): any {
  console.log('🔄 Building fallback creative character traits from description');
  
  return {
    gender: character.gender || 'not specified',
    ethnicity: character.species || 'not specified',
    social_class: 'appropriate for world',
    occupation: 'character role',
    genre: character.genre || 'creative',
    species: character.species || 'not specified',
    universe: character.universe || 'fictional world',
    magical_abilities: character.magical_abilities || 'none',
    technological_augmentations: character.technological_augmentations || 'none',
    personality_traits: character.personality_traits || character.description?.substring(0, 200) || 'creative character',
    backstory: character.backstory || character.description || 'creative background',
    ...getCreativeDefaults(character)
  };
}

function getCreativeDefaults(character: CharacterTraitRequest): any {
  // Provide creative-informed defaults based on genre
  const isHighFantasy = character.genre?.toLowerCase().includes('fantasy');
  const isSciFi = character.genre?.toLowerCase().includes('sci');
  
  return {
    big_five: {
      openness: isHighFantasy || isSciFi ? 0.8 : 0.7, // Creative characters tend to be more open
      conscientiousness: 0.6,
      extraversion: 0.6,
      agreeableness: 0.6,
      neuroticism: 0.4,
    },
    moral_foundations: {
      care: 0.7,
      fairness: 0.7,
      loyalty: 0.6,
      authority: isHighFantasy ? 0.6 : 0.4, // Fantasy often has hierarchies
      sanctity: isHighFantasy ? 0.6 : 0.3,
      liberty: isSciFi ? 0.8 : 0.6, // Sci-fi often explores freedom themes
    },
    world_values: {
      traditional_vs_secular: isHighFantasy ? 0.3 : 0.6,
      survival_vs_self_expression: 0.6,
      materialist_vs_postmaterialist: isSciFi ? 0.7 : 0.5,
    },
    political_compass: {
      economic: 0.2,
      authoritarian_libertarian: isSciFi ? 0.4 : 0.1,
      cultural_conservative_progressive: isSciFi ? 0.6 : 0.3,
      political_salience: 0.5,
    },
    behavioral_economics: {
      present_bias: 0.4,
      loss_aversion: 0.5,
      overconfidence: 0.6, // Heroes often have confidence
      risk_sensitivity: 0.4, // Creative characters often take risks
      scarcity_sensitivity: 0.5,
    },
    cultural_dimensions: {
      power_distance: isHighFantasy ? 0.7 : 0.4,
      individualism_vs_collectivism: 0.6,
      masculinity_vs_femininity: 0.5,
      uncertainty_avoidance: 0.4, // Creative worlds have uncertainty
      long_term_orientation: 0.6,
      indulgence_vs_restraint: 0.6,
    },
  };
}

function buildComprehensiveCharacterPrompt(character: CharacterTraitRequest): string {
  const description = character.primary_description || character.description;
  const historicalDate = character.historical_date || character.date_of_birth;
  
  return `
Analyze this detailed character description and generate a comprehensive psychological and cultural profile:

**Primary Character Description:**
${description || 'No detailed description provided'}

**Basic Information:**
- Name: ${character.name}
- Date of Birth: ${historicalDate || 'Unknown'}
- Age: ${character.age}
- Location: ${character.region || 'Not specified'}

**Additional Context (if provided):**
- Gender: ${character.gender || 'To be determined from description'}
- Ethnicity: ${character.ethnicity || 'To be determined from description'}
- Social Class: ${character.social_class || 'To be determined from description'}
- Occupation: ${character.occupation || 'To be determined from description'}
- Personality Traits: ${character.personality_traits || 'To be extracted from description'}
- Backstory: ${character.backstory || 'To be extracted from description'}
- Historical Context: ${character.historical_context || 'To be extracted from description'}

**CRITICAL INSTRUCTIONS:**
1. Extract gender, ethnicity, social class, occupation, and historical period DIRECTLY from the description
2. Determine the appropriate historical time period and cultural/religious context
3. Generate traits that reflect the specific historical era and cultural background described
4. Pay special attention to unique skills, roles, and characteristics mentioned
5. Create appropriate religious/spiritual context for the historical period (NOT modern religions unless specifically mentioned)

Generate a comprehensive profile in this JSON format:
{
  "gender": "extracted from description",
  "ethnicity": "cultural/ethnic background from description",
  "social_class": "social standing from description", 
  "occupation": "role/profession from description",
  "historical_period": "specific historical era extracted from description",
  "religious_affiliation": "appropriate for historical period and culture",
  "religious_practice_level": "appropriate for context",
  "cultural_context": "detailed cultural background",
  "region": "geographical location from description",
  "urban_rural_context": "living environment type",
  "education_level": "appropriate for historical period",
  "physical_appearance": {
    "height_build": "physical description from context",
    "hair": "hair description appropriate for period/culture",
    "eye_color": "eye color fitting the ethnicity/region",
    "skin_tone": "skin tone appropriate for ethnicity/region",
    "ethnicity": "ethnic background"
  },
  "personality_traits": "detailed personality from description",
  "backstory": "comprehensive background story",
  "appearance": "full physical appearance description",
  "historical_context": "detailed historical and cultural context",
  "relationships_family": {
    "marital_status": "appropriate for age/culture/period",
    "has_children": "boolean based on context",
    "family_relationship_quality": "relationship dynamics",
    "living_situation": "household arrangement",
    "support_system_strength": "community connections"
  },
  "big_five": {
    "openness": 0.0-1.0,
    "conscientiousness": 0.0-1.0,
    "extraversion": 0.0-1.0,
    "agreeableness": 0.0-1.0,
    "neuroticism": 0.0-1.0
  },
  "moral_foundations": {
    "care": 0.0-1.0,
    "fairness": 0.0-1.0,
    "loyalty": 0.0-1.0,
    "authority": 0.0-1.0,
    "sanctity": 0.0-1.0,
    "liberty": 0.0-1.0
  },
  "world_values": {
    "traditional_vs_secular": 0.0-1.0,
    "survival_vs_self_expression": 0.0-1.0,
    "materialist_vs_postmaterialist": 0.0-1.0
  },
  "political_compass": {
    "economic": -1.0 to 1.0,
    "authoritarian_libertarian": -1.0 to 1.0,
    "cultural_conservative_progressive": -1.0 to 1.0,
    "political_salience": 0.0-1.0
  },
  "behavioral_economics": {
    "present_bias": 0.0-1.0,
    "loss_aversion": 0.0-1.0,
    "overconfidence": 0.0-1.0,
    "risk_sensitivity": 0.0-1.0,
    "scarcity_sensitivity": 0.0-1.0
  },
  "cultural_dimensions": {
    "power_distance": 0.0-1.0,
    "individualism_vs_collectivism": 0.0-1.0,
    "masculinity_vs_femininity": 0.0-1.0,
    "uncertainty_avoidance": 0.0-1.0,
    "long_term_orientation": 0.0-1.0,
    "indulgence_vs_restraint": 0.0-1.0
  }
}

Extract ALL information from the detailed description. Do not use generic defaults - use the specific details provided in the character description.
`;

function parseComprehensiveTraitResponse(response: string, character: CharacterTraitRequest): any {
  try {
    // Extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log('⚠️ No JSON found in AI response, using fallback parsing');
      return buildFallbackFromDescription(character);
    }

    const parsedTraits = JSON.parse(jsonMatch[0]);
    console.log('✅ Successfully parsed AI-generated traits');
    
    // Build complete trait profile with extracted information
    return {
      // Core demographics extracted from description
      gender: parsedTraits.gender || character.gender || 'not specified',
      ethnicity: parsedTraits.ethnicity || character.ethnicity || 'not specified',
      race_ethnicity: parsedTraits.ethnicity || character.ethnicity || 'not specified',
      social_class: parsedTraits.social_class || character.social_class || 'not specified',
      social_class_identity: parsedTraits.social_class || character.social_class || 'not specified',
      occupation: parsedTraits.occupation || character.occupation || 'not specified',
      historical_period: parsedTraits.historical_period || extractHistoricalPeriodFromDescription(character),
      region: parsedTraits.region || character.region || 'not specified',
      
      // Religious context appropriate for historical period
      religious_affiliation: parsedTraits.religious_affiliation || 'traditional beliefs',
      religious_practice_level: parsedTraits.religious_practice_level || 'moderate',
      
      // Cultural and social context
      cultural_context: parsedTraits.cultural_context || 'historical cultural context',
      cultural_background: parsedTraits.ethnicity || character.ethnicity || 'not specified',
      urban_rural_context: parsedTraits.urban_rural_context || 'rural',
      education_level: parsedTraits.education_level || 'traditional knowledge',
      
      // Physical appearance
      physical_appearance: {
        height_build: parsedTraits.physical_appearance?.height_build || 'average height and build',
        hair: parsedTraits.physical_appearance?.hair || 'appropriate for ethnicity and period',
        eye_color: parsedTraits.physical_appearance?.eye_color || 'appropriate for ethnicity',
        skin_tone: parsedTraits.physical_appearance?.skin_tone || 'appropriate for ethnicity',
        ethnicity: parsedTraits.physical_appearance?.ethnicity || parsedTraits.ethnicity || 'not specified',
      },
      
      // Relationships and family
      relationships_family: parsedTraits.relationships_family || {
        marital_status: 'appropriate for age and culture',
        has_children: false,
        family_relationship_quality: 'good',
        living_situation: 'traditional arrangement',
        support_system_strength: 'strong community bonds'
      },
      
      // Rich character details from description
      personality_traits: parsedTraits.personality_traits || character.personality_traits || 'extracted from description',
      backstory: parsedTraits.backstory || character.backstory || 'developed from description',
      appearance: parsedTraits.appearance || 'detailed appearance from description',
      historical_context: parsedTraits.historical_context || character.historical_context || 'rich historical context',
      
      // Psychological trait scores
      big_five: parsedTraits.big_five || getHistoricalDefaults(character).big_five,
      moral_foundations: parsedTraits.moral_foundations || getHistoricalDefaults(character).moral_foundations,
      world_values: parsedTraits.world_values || getHistoricalDefaults(character).world_values,
      political_compass: {
        ...parsedTraits.political_compass,
        group_fusion_level: 0.6,
        outgroup_threat_sensitivity: 0.4,
        commons_orientation: 0.7,
        political_motivations: {
          material_interest: 0.5,
          moral_vision: 0.6,
          cultural_preservation: 0.7,
          status_reordering: 0.3,
        },
      },
      behavioral_economics: parsedTraits.behavioral_economics || getHistoricalDefaults(character).behavioral_economics,
      cultural_dimensions: parsedTraits.cultural_dimensions || getHistoricalDefaults(character).cultural_dimensions,
      
      // Extended trait system
      social_identity: {
        identity_strength: 0.7,
        identity_complexity: 0.5,
        ingroup_bias_tendency: 0.6,
        outgroup_bias_tendency: 0.4,
        social_dominance_orientation: 0.3,
        system_justification: 0.6,
        intergroup_contact_comfort: 0.5,
        cultural_intelligence: 0.6,
      },
      extended_traits: {
        truth_orientation: 0.7,
        moral_consistency: 0.6,
        self_awareness: 0.5,
        empathy: 0.6,
        self_efficacy: 0.7,
        manipulativeness: 0.2,
        impulse_control: 0.6,
        shadow_trait_activation: 0.3,
        attention_pattern: 0.5,
        cognitive_load_resilience: 0.6,
        institutional_trust: 0.7,
        conformity_tendency: 0.5,
        conflict_avoidance: 0.4,
        cognitive_flexibility: 0.6,
        need_for_cognitive_closure: 0.5,
        emotional_intensity: 0.5,
        emotional_regulation: 0.6,
        trigger_sensitivity: 0.4,
      },
      dynamic_state: {
        current_stress_level: 0.3,
        emotional_stability_context: 0.6,
        motivation_orientation: 0.7,
        trust_volatility: 0.4,
        trigger_threshold: 0.5,
      },
      physical_health: {
        disabilities: [],
        health_conditions: [],
        mobility: 'normal',
      },
    };
  } catch (error) {
    console.error('❌ Error parsing AI trait response:', error);
    return buildFallbackFromDescription(character);
  }
}

function extractHistoricalPeriodFromDescription(character: CharacterTraitRequest): string {
  const description = character.primary_description || character.description || '';
  const dateOfBirth = character.historical_date || character.date_of_birth;
  
  // Look for period keywords in description
  if (description.toLowerCase().includes('epipaleolithic') || description.toLowerCase().includes('natufian')) {
    return 'Epipaleolithic/Mesolithic';
  }
  if (description.toLowerCase().includes('paleolithic')) {
    return 'Paleolithic';
  }
  if (description.toLowerCase().includes('neolithic')) {
    return 'Neolithic';
  }
  if (description.toLowerCase().includes('bronze age')) {
    return 'Bronze Age';
  }
  if (description.toLowerCase().includes('medieval')) {
    return 'Medieval';
  }
  
  // Try to parse from date if available
  if (dateOfBirth) {
    const year = parseInt(dateOfBirth.split('-')[0]) || parseInt(dateOfBirth.match(/\d{4}/)?.[0] || '');
    if (year) {
      if (year < -8000) return 'Paleolithic';
      if (year < -4000) return 'Epipaleolithic/Mesolithic';
      if (year < -3000) return 'Neolithic';
      if (year < 0) return 'Bronze/Iron Age';
      if (year < 500) return 'Classical Antiquity';
      if (year < 1000) return 'Early Medieval';
      if (year < 1500) return 'Medieval';
      if (year < 1800) return 'Early Modern';
      return 'Modern';
    }
  }
  
  return 'Historical Period';
}

function buildFallbackFromDescription(character: CharacterTraitRequest): any {
  console.log('🔄 Building fallback character traits from description');
  const description = character.primary_description || character.description || '';
  
  // Extract basic info from description using simple text analysis
  const isFemale = description.toLowerCase().includes('female') || description.toLowerCase().includes('woman') || description.toLowerCase().includes('she ');
  const isMale = description.toLowerCase().includes('male') || description.toLowerCase().includes('man') || description.toLowerCase().includes('he ');
  
  return {
    gender: isFemale ? 'female' : (isMale ? 'male' : character.gender || 'not specified'),
    ethnicity: 'extracted from description',
    social_class: 'traditional society',
    occupation: character.occupation || 'traditional role',
    historical_period: extractHistoricalPeriodFromDescription(character),
    religious_affiliation: 'traditional beliefs',
    personality_traits: character.personality_traits || description.substring(0, 200),
    backstory: character.backstory || description,
    ...getHistoricalDefaults(character)
  };
}

function getHistoricalDefaults(character: CharacterTraitRequest): any {
  // Provide historically-informed defaults based on era and region
  const isPreIndustrial = character.date_of_birth && new Date(character.date_of_birth).getFullYear() < 1800;
  
  return {
    big_five: {
      openness: isPreIndustrial ? 0.4 : 0.6,
      conscientiousness: character.social_class === 'upper class' ? 0.7 : 0.6,
      extraversion: 0.5,
      agreeableness: 0.6,
      neuroticism: 0.4,
    },
    moral_foundations: {
      care: 0.7,
      fairness: 0.6,
      loyalty: isPreIndustrial ? 0.8 : 0.6,
      authority: isPreIndustrial ? 0.8 : 0.5,
      sanctity: isPreIndustrial ? 0.7 : 0.4,
      liberty: isPreIndustrial ? 0.3 : 0.6,
    },
    world_values: {
      traditional_vs_secular: isPreIndustrial ? 0.2 : 0.4,
      survival_vs_self_expression: isPreIndustrial ? 0.3 : 0.5,
      materialist_vs_postmaterialist: 0.5,
    },
    political_compass: {
      economic: 0.3,
      authoritarian_libertarian: isPreIndustrial ? -0.3 : 0.2,
      cultural_conservative_progressive: isPreIndustrial ? -0.5 : 0.4,
      political_salience: 0.5,
    },
    behavioral_economics: {
      present_bias: 0.4,
      loss_aversion: 0.6,
      overconfidence: 0.5,
      risk_sensitivity: 0.6,
      scarcity_sensitivity: isPreIndustrial ? 0.8 : 0.6,
    },
    cultural_dimensions: {
      power_distance: isPreIndustrial ? 0.8 : 0.6,
      individualism_vs_collectivism: isPreIndustrial ? 0.3 : 0.5,
      masculinity_vs_femininity: 0.5,
      uncertainty_avoidance: 0.6,
      long_term_orientation: 0.7,
      indulgence_vs_restraint: 0.4,
    },
  };
}
