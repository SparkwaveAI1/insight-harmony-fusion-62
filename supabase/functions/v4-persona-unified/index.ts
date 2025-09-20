import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { generateChatResponse } from '../_shared/openai.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_description, user_id } = await req.json()
    
    console.log('🚀 Starting V4 Unified Persona Generation')
    console.log('User description:', user_description?.slice(0, 100) + '...')
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not found')
    }

    // Generate persona ID
    const persona_id = `v4_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    console.log('Generated persona ID:', persona_id)

    // PHASE 1: Background Generation (4-6 sentences)
    console.log('📝 Phase 1: Generating background story...')
    const backgroundMessages = [
      {
        role: 'system',
        content: `Generate a realistic 4-6 sentence life story background for a persona based on the user's description. Focus on:
- Current life situation and how they got there
- Key relationships (family, friends, colleagues)
- Major life challenges or formative experiences
- Current living situation and circumstances

Write in third person, past tense. Make it authentic and grounded in real-world experiences. Avoid clichés.`
      },
      {
        role: 'user', 
        content: user_description
      }
    ]
    
    const backgroundResponse = await generateChatResponse(backgroundMessages, openaiApiKey, {
      model: 'gpt-4.1-2025-04-14',
      temperature: 0.8,
      max_tokens: 200
    })
    
    const background = backgroundResponse.choices[0]?.message?.content?.trim()
    console.log('✅ Background generated:', background?.slice(0, 100) + '...')

    // PHASE 2: Character Description (2-3 sentences)
    console.log('🎭 Phase 2: Generating character essence...')
    const descriptionMessages = [
      {
        role: 'system',
        content: `Generate a 2-3 sentence character essence description that captures how this person approaches life. Focus on:
- Core personality traits and worldview
- How they handle challenges and relationships
- Their general demeanor and outlook

Write in third person, present tense. Make it insightful and authentic.`
      },
      {
        role: 'user',
        content: `Based on this background: ${background}\n\nOriginal description: ${user_description}`
      }
    ]
    
    const descriptionResponse = await generateChatResponse(descriptionMessages, openaiApiKey, {
      model: 'gpt-4.1-2025-04-14', 
      temperature: 0.7,
      max_tokens: 150
    })
    
    const characterDescription = descriptionResponse.choices[0]?.message?.content?.trim()
    console.log('✅ Character description generated:', characterDescription?.slice(0, 100) + '...')

    // PHASE 3: Physical Appearance (detailed paragraph)
    console.log('👤 Phase 3: Generating physical appearance...')
    const appearanceMessages = [
      {
        role: 'system',
        content: `Generate a detailed physical appearance description for image generation. Include:
- Age-appropriate features and build
- Hair color, style, and condition
- Eye color and facial features
- Clothing style that fits their background
- Overall grooming and presentation
- Any distinguishing characteristics

Write as a detailed paragraph suitable for AI image generation. Be specific and realistic.`
      },
      {
        role: 'user',
        content: `Based on this persona:
Background: ${background}
Character: ${characterDescription}
Original description: ${user_description}`
      }
    ]
    
    const appearanceResponse = await generateChatResponse(appearanceMessages, openaiApiKey, {
      model: 'gpt-4.1-2025-04-14',
      temperature: 0.7,
      max_tokens: 250
    })
    
    const physicalDescription = appearanceResponse.choices[0]?.message?.content?.trim()
    console.log('✅ Physical appearance generated:', physicalDescription?.slice(0, 100) + '...')

    // PHASE 4: Image Generation
    console.log('🎨 Phase 4: Generating persona image...')
    let profileImageUrl = null
    
    try {
      const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt: `Professional headshot portrait: ${physicalDescription}. High quality, realistic, well-lit, neutral background.`,
          size: '1024x1024',
          quality: 'high',
          output_format: 'webp'
        })
      })

      if (imageResponse.ok) {
        const imageData = await imageResponse.json()
        const imageBase64 = imageData.data[0].b64_json
        
        if (imageBase64) {
          // Convert base64 to blob for storage
          const byteCharacters = atob(imageBase64)
          const byteNumbers = new Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          const byteArray = new Uint8Array(byteNumbers)
          const blob = new Blob([byteArray], { type: 'image/webp' })
          
          // Upload to Supabase Storage
          const fileName = `${persona_id}.webp`
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('persona-images')
            .upload(fileName, blob, {
              contentType: 'image/webp',
              upsert: true
            })

          if (uploadError) {
            console.error('❌ Image upload failed:', uploadError)
          } else {
            // Get public URL
            const { data: urlData } = supabase.storage
              .from('persona-images')
              .getPublicUrl(fileName)
            
            profileImageUrl = urlData.publicUrl
            console.log('✅ Image generated and uploaded:', profileImageUrl)
          }
        }
      } else {
        console.error('❌ Image generation failed:', await imageResponse.text())
      }
    } catch (imageError) {
      console.error('❌ Image generation error:', imageError)
      // Continue without image - don't fail the entire persona creation
    }

    // PHASE 5: Full Persona JSON Generation
    console.log('🧠 Phase 5: Generating complete persona JSON...')
    const personaJsonMessages = [
      {
        role: 'system',
        content: `You are PersonaGPT, an advanced AI that creates realistic human personas. Generate a complete persona JSON based on the provided context.

CRITICAL REQUIREMENTS:
- Use natural trait variation (0.1-0.9 range, avoid 0.5 defaults)
- Ensure gender consistency across ALL fields and pronouns
- Generate realistic, coherent personality traits
- No statistical normalization - let traits vary naturally
- Coherence values: 0.1-0.3 (scattered), 0.3-0.4 (average), 0.5-0.6 (organized), 0.7+ (highly structured)

DATA TYPE REQUIREMENTS:
- income_bracket: Use numeric ranges like "35000-50000", "75000-100000", "25000-35000" (NO text categories)
- age: Must be a number (e.g., 34)
- sleep_hours: Must be a number (e.g., 7.5)
- emergency_fund_months: Must be a number (e.g., 3)
- dependents: Must be a number (e.g., 2)
- bmi: Use numeric BMI value (e.g., 24.5, 28.3) NOT categories
- primary_activities: Use hours per day as integers (e.g., "work": 8, "family_time": 4)
- time_sentiment: Use simple states only ("satisfied", "stressful", "content", "rushed", "peaceful")
- All trait values in primary_drivers, cognitive, etc.: Use decimals 0.1-0.9

Use this EXACT JSON structure:

{
  "identity": {
    "name": "",
    "age": 0,
    "gender": "",
    "pronouns": "",
    "ethnicity": "",
    "nationality": "United States",
    "occupation": "",
    "relationship_status": "",
    "dependents": 0,
    "education_level": "",
    "income_bracket": "35000-50000",
    "location": {
      "city": "",
      "region": "",
      "country": "United States",
      "urbanicity": "urban"
    }
  },
  "daily_life": {
    "primary_activities": {
      "work": 8,
      "family_time": 4,
      "personal_care": 2,
      "personal_interests": 3,
      "social_interaction": 2
    },
    "schedule_blocks": [
      {
        "start": "08:00",
        "end": "17:00",
        "activity": "",
        "setting": ""
      }
    ],
    "time_sentiment": {
      "work": "satisfied",
      "family": "content",
      "personal": "peaceful"
    },
    "screen_time_summary": "",
    "mental_preoccupations": []
  },
  "health_profile": {
    "bmi": 24.5,
    "chronic_conditions": [],
    "mental_health_flags": [],
    "medications": [],
    "adherence_level": "",
    "sleep_hours": 7.5,
    "substance_use": {
      "alcohol": "",
      "cigarettes": "",
      "vaping": "",
      "marijuana": ""
    },
    "fitness_level": "",
    "diet_pattern": ""
  },
  "relationships": {
    "household": {
      "status": "",
      "harmony_level": "",
      "dependents": 0
    },
    "caregiving_roles": [],
    "friend_network": {
      "size": "",
      "frequency": "",
      "anchor_contexts": []
    },
    "pets": []
  },
  "money_profile": {
    "attitude_toward_money": "",
    "earning_context": "",
    "spending_style": "",
    "savings_investing_habits": {
      "emergency_fund_months": 3,
      "retirement_contributions": "",
      "investing_style": ""
    },
    "debt_posture": "",
    "financial_stressors": [],
    "money_conflicts": "",
    "generosity_profile": ""
  },
  "motivation_profile": {
    "primary_motivation_labels": [],
    "deal_breakers": [],
    "primary_drivers": {
      "care": 0.7,
      "family": 0.8,
      "status": 0.3,
      "mastery": 0.6,
      "meaning": 0.5,
      "novelty": 0.2,
      "security": 0.9,
      "belonging": 0.4,
      "self_interest": 0.3
    },
    "goal_orientation": {
      "strength": 0.6,
      "time_horizon": "medium-term",
      "primary_goals": [],
      "goal_flexibility": 0.4
    },
    "want_vs_should_tension": {
      "major_conflicts": [],
      "default_resolution": ""
    }
  },
  "communication_style": {
    "regional_register": {
      "region": "",
      "urbanicity": "urban",
      "dialect_hints": []
    },
    "voice_foundation": {
      "formality": "",
      "directness": "",
      "pace_rhythm": "",
      "positivity": "",
      "empathy_level": 0.7,
      "honesty_style": "",
      "charisma_level": 0.5
    },
    "style_markers": {
      "metaphor_domains": [],
      "aphorism_register": "",
      "storytelling_vs_bullets": 0.6,
      "humor_style": "",
      "code_switching_contexts": []
    },
    "context_switches": {
      "work": {
        "formality": "",
        "directness": ""
      },
      "home": {
        "formality": "",
        "directness": ""
      },
      "online": {
        "formality": "",
        "directness": ""
      }
    },
    "authenticity_filters": {
      "avoid_registers": [],
      "embrace_registers": [],
      "personality_anchors": []
    }
  },
  "humor_profile": {
    "frequency": "",
    "style": [],
    "boundaries": [],
    "targets": [],
    "use_cases": []
  },
  "truth_honesty_profile": {
    "baseline_honesty": 0.8,
    "situational_variance": {
      "work": 0.7,
      "home": 0.9,
      "public": 0.6
    },
    "typical_distortions": [],
    "red_lines": [],
    "pressure_points": [],
    "confession_style": ""
  },
  "bias_profile": {
    "cognitive": {
      "status_quo": 0.5,
      "loss_aversion": 0.7,
      "confirmation": 0.6,
      "anchoring": 0.4,
      "availability": 0.5,
      "optimism": 0.3,
      "sunk_cost": 0.4,
      "overconfidence": 0.2
    },
    "mitigations": []
  },
  "cognitive_profile": {
    "verbal_fluency": 0.7,
    "abstract_reasoning": 0.6,
    "problem_solving_orientation": "methodical",
    "thought_coherence": 0.5
  },
  "emotional_profile": {
    "stress_responses": [],
    "negative_triggers": [],
    "positive_triggers": [],
    "explosive_triggers": [],
    "emotional_regulation": ""
  },
  "attitude_narrative": "",
  "political_narrative": "",
  "adoption_profile": {
    "buyer_power": 0.4,
    "adoption_influence": 0.3,
    "risk_tolerance": 0.5,
    "change_friction": 0.6,
    "expected_objections": [],
    "proof_points_needed": []
  },
  "prompt_shaping": {
    "voice_foundation": {
      "formality": "",
      "directness": "",
      "pace_rhythm": "",
      "positivity": "",
      "empathy_level": 0.7
    },
    "style_markers": {
      "metaphor_domains": [],
      "humor_style": "",
      "storytelling_vs_bullets": 0.6
    },
    "primary_motivations": [],
    "deal_breakers": [],
    "honesty_vector": {
      "baseline": 0.8,
      "work": 0.7,
      "home": 0.9,
      "public": 0.6,
      "distortions": []
    },
    "bias_vector": {
      "top_cognitive": [],
      "top_social": [],
      "mitigation_playbook": []
    },
    "context_switches": {
      "work": "",
      "home": "",
      "online": ""
    },
    "current_focus": ""
  }
}

Return ONLY valid JSON with no additional text.`
      },
      {
        role: 'user',
        content: `Generate a complete persona JSON using this context:

BACKGROUND: ${background}

CHARACTER ESSENCE: ${characterDescription}

PHYSICAL APPEARANCE: ${physicalDescription}

ORIGINAL USER DESCRIPTION: ${user_description}

Ensure all traits are coherent with the background story and character essence. Use natural trait variation throughout.`
      }
    ]
    
    const personaJsonResponse = await generateChatResponse(personaJsonMessages, openaiApiKey, {
      model: 'gpt-4.1-2025-04-14',
      temperature: 0.6,
      max_tokens: 4000
    })
    
    const personaJsonString = personaJsonResponse.choices[0]?.message?.content?.trim()
    console.log('✅ Persona JSON generated, length:', personaJsonString?.length)
    
    let fullProfile
    try {
      fullProfile = JSON.parse(personaJsonString)
      console.log('✅ JSON parsing successful')
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError)
      throw new Error('Failed to parse generated persona JSON')
    }

    // Extract name from the generated profile
    const personaName = fullProfile.identity?.name || 'Generated Persona'
    
    // Create conversation summary from the generated content
    const conversationSummary = {
      demographics: {
        age: fullProfile.identity?.age || null,
        location: fullProfile.identity?.location?.city || null,
        occupation: fullProfile.identity?.occupation || null,
        name: personaName,
        background_description: background
      },
      character_description: characterDescription,
      communication_style: {
        directness: fullProfile.communication_style?.voice_foundation?.directness || '',
        formality: fullProfile.communication_style?.voice_foundation?.formality || '',
        response_patterns: fullProfile.communication_style?.style_markers?.storytelling_vs_bullets || 0
      },
      motivational_summary: fullProfile.motivation_profile?.primary_motivation_labels?.join(', ') || '',
      personality_summary: characterDescription,
      physical_description: physicalDescription
    }

    // Store in database
    console.log('💾 Storing persona in database...')
    const { data: insertData, error: insertError } = await supabase
      .from('v4_personas')
      .insert({
        persona_id: persona_id,
        name: personaName,
        user_id: user_id,
        full_profile: fullProfile,
        conversation_summary: conversationSummary,
        background: background,
        profile_image_url: profileImageUrl,
        creation_stage: 'completed',
        creation_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Database insertion failed:', insertError)
      throw insertError
    }

    console.log('✅ V4 Unified Persona Generation Complete!')
    
    return new Response(
      JSON.stringify({
        success: true,
        persona_id: persona_id,
        persona_name: personaName,
        stage: 'creation_complete',
        background: background,
        character_description: characterDescription,
        physical_description: physicalDescription,
        profile_image_url: profileImageUrl,
        message: 'Persona created successfully with unified generation!'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('❌ Error in v4-persona-unified:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Persona generation failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})