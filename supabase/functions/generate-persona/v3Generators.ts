import { generateChatResponse } from "../_shared/openai.ts";
import { extractUserDetails } from "./inputProcessor.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

// V3 Memory Generator
export async function generateMemory(basePersona: any, prompt: string): Promise<any> {
  console.log(`Generating V3 memory for: ${basePersona.name}`);
  
  const messages = [
    {
      role: "system",
      content: `Generate memory patterns and formative experiences that explain this persona's current psychology. Create specific, memorable events that shaped who they are. Return ONLY valid JSON.

REQUIRED V3 STRUCTURE:
{
  "memory": {
    "persistence": {
      "long_term": 0.8,
      "short_term": 0.6
    },
    "long_term_events": [
      {
        "event": "Won a design competition in college despite imposter syndrome",
        "valence": "positive",
        "timestamp": "2019-03-15",
        "recall_cues": ["competition", "design", "recognition", "validation"],
        "impact_on_behavior": "Increased confidence in creative abilities but still seeks external validation"
      },
      {
        "event": "Parents initially rejected their career choice and demanded they study medicine",
        "valence": "negative", 
        "timestamp": "2018-09-01",
        "recall_cues": ["parents", "disapproval", "career", "expectations"],
        "impact_on_behavior": "Strong drive to prove creative careers are legitimate, sensitivity to authority figures"
      },
      {
        "event": "First time speaking up about workplace discrimination and being supported by colleagues",
        "valence": "positive",
        "timestamp": "2022-06-20",
        "recall_cues": ["speaking up", "support", "justice", "colleagues"],
        "impact_on_behavior": "More willing to advocate for others and challenge unfair systems"
      }
    ],
    "short_term_slots": 7
  }
}

DISTINCTIVENESS REQUIREMENTS:
- Create 3-5 specific formative events that explain their current personality
- Events should connect to their traits, values, and current behavior patterns
- Include both positive and negative formative experiences
- Recall cues should be specific words/concepts that trigger these memories
- Impact descriptions should explain how these events still influence them today
- Make the events feel real and specific to their background/culture/experience`
    },
    {
      role: "user", 
      content: `Generate memory for: ${basePersona.name} (${basePersona.identity.occupation}, age ${basePersona.identity.age}), based on: ${prompt}`
    }
  ];

  const response = await generateChatResponse(messages, OPENAI_API_KEY, {
    model: 'gpt-4.1-2025-04-14',
    temperature: 0.9,
    max_tokens: 1500
  });
  
  const content = response.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse V3 memory JSON:', content);
    throw new Error('Invalid JSON response from OpenAI for V3 memory');
  }
}

// V3 State Modifiers Generator
export async function generateStateModifiers(basePersona: any, prompt: string): Promise<any> {
  console.log(`Generating V3 state modifiers for: ${basePersona.name}`);
  
  const messages = [
    {
      role: "system",
      content: `Generate dynamic state modifiers that show how this persona's behavior changes under different conditions. Create realistic current state and rules for how stress, fatigue, etc. affect them. Return ONLY valid JSON.

REQUIRED V3 STRUCTURE:
{
  "state_modifiers": {
    "current_state": {
      "fatigue": 0.4,
      "acute_stress": 0.6,
      "mood_valence": 0.7,
      "social_safety": 0.8,
      "time_pressure": 0.5
    },
    "state_to_shift_rules": [
      {
        "when": {"fatigue": ">0.7"},
        "shift": {"directness": "+0.2", "empathy": "-0.1", "patience": "-0.3"}
      },
      {
        "when": {"acute_stress": ">0.8"},
        "shift": {"creativity": "-0.2", "detail_focus": "-0.2", "risk_aversion": "+0.3"}
      },
      {
        "when": {"social_safety": "<0.3"},
        "shift": {"openness": "-0.4", "conformity": "+0.2", "self_disclosure": "-0.5"}
      },
      {
        "when": {"time_pressure": ">0.8"},
        "shift": {"decision_speed": "+0.3", "thoroughness": "-0.2", "collaboration": "-0.1"}
      }
    ]
  }
}

DISTINCTIVENESS REQUIREMENTS:
- Current state should reflect their recent life situation and stressors
- State shift rules should be specific to their personality and coping patterns
- Rules should show how their core traits get modified under different conditions
- Make the shifts realistic - tired people are less patient, stressed people less creative
- Include both positive and negative state interactions
- Shifts should feel authentic to how this specific person would react`
    },
    {
      role: "user",
      content: `Generate state modifiers for: ${basePersona.name} (${basePersona.identity.occupation}), considering their current life situation from: ${prompt}`
    }
  ];

  const response = await generateChatResponse(messages, OPENAI_API_KEY, {
    model: 'gpt-4.1-2025-04-14',
    temperature: 0.9,
    max_tokens: 1200
  });
  
  const content = response.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse V3 state modifiers JSON:', content);
    throw new Error('Invalid JSON response from OpenAI for V3 state modifiers');
  }
}

// V3 Linguistic Style Generator
export async function generateLinguisticStyle(basePersona: any, prompt: string): Promise<any> {
  console.log(`Generating V3 linguistic style for: ${basePersona.name}`);
  
  const messages = [
    {
      role: "system",
      content: `Generate a distinctive linguistic style that reflects this persona's background, personality, and communication patterns. Create a unique voice signature. Return ONLY valid JSON.

REQUIRED V3 STRUCTURE:
{
  "linguistic_style": {
    "base_voice": {
      "formality": "casual-professional",
      "verbosity": "moderate-detailed",
      "directness": "diplomatic-direct",
      "politeness": "warm-professional"
    },
    "syntax_and_rhythm": {
      "complexity": "varied-complex",
      "disfluencies": ["um", "like", "you know"],
      "signature_phrases": ["that makes sense", "I'm thinking", "honestly"],
      "avg_sentence_tokens": {
        "baseline_max": 25,
        "baseline_min": 8
      }
    },
    "anti_mode_collapse": {
      "forbidden_frames": [
        "At the end of the day",
        "It is what it is", 
        "Think outside the box",
        "Low-hanging fruit",
        "Game changer"
      ],
      "must_include_one_of": {
        "opinion": ["I think", "In my experience", "From what I've seen"],
        "uncertainty": ["I'm not entirely sure", "It seems like", "My sense is"],
        "emphasis": ["Really", "Definitely", "Absolutely"]
      }
    },
    "lexical_preferences": {
      "hedges": ["probably", "sort of", "I think", "maybe"],
      "modal_verbs": ["could", "might", "should", "would"],
      "affect_words": {
        "negative_bias": 0.3,
        "positive_bias": 0.7
      }
    },
    "response_shapes_by_intent": {
      "opinion": ["Here's my take:", "I see it as", "My perspective is"],
      "advice": ["You might consider", "One approach could be", "Have you thought about"],
      "story": ["This reminds me of", "I remember when", "Similar thing happened"]
    }
  }
}

DISTINCTIVENESS REQUIREMENTS:
- Base voice should reflect their personality, background, and generation
- Disfluencies and signature phrases should feel natural to their character
- Forbidden frames should include generic corporate/self-help speak
- Must-include phrases should provide variety while maintaining their voice
- Lexical preferences should match their emotional style and cultural background
- Response shapes should give them consistent but varied ways to express different intents
- Make their linguistic signature memorable and authentic to who they are`
    },
    {
      role: "user",
      content: `Generate linguistic style for: ${basePersona.name} (${basePersona.identity.age}yo ${basePersona.identity.occupation}, ${basePersona.identity.cultural_background}), based on: ${prompt}`
    }
  ];

  const response = await generateChatResponse(messages, OPENAI_API_KEY, {
    model: 'gpt-4.1-2025-04-14', 
    temperature: 0.9,
    max_tokens: 1500
  });
  
  const content = response.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse V3 linguistic style JSON:', content);
    throw new Error('Invalid JSON response from OpenAI for V3 linguistic style');
  }
}

// V3 Social Profiles Generator
export async function generateSocialProfiles(basePersona: any, prompt: string): Promise<any> {
  console.log(`Generating V3 social profiles for: ${basePersona.name}`);
  
  const messages = [
    {
      role: "system",
      content: `Generate social behavior patterns that show how this persona interacts in groups and relationships. Create realistic social tendencies. Return ONLY valid JSON.

REQUIRED V3 STRUCTURE:
{
  "group_behavior": {
    "assertiveness": "medium",
    "interruption_tolerance": "low-medium",
    "self_disclosure_rate": "selective-high"
  },
  "social_cognition": {
    "empathy": "high",
    "theory_of_mind": "excellent",
    "conflict_orientation": "collaborative-avoidant"
  },
  "sexuality_profile": {
    "orientation": "pansexual",
    "expression": "private",
    "flirtatiousness": "low",
    "libido_level": "medium",
    "relationship_norms": "monogamous with communication focus"
  }
}

DISTINCTIVENESS REQUIREMENTS:
- Assertiveness should match their personality and cultural background
- Social behaviors should be specific, not generic "medium" ratings
- Empathy and theory of mind should reflect their cognitive profile
- Sexuality profile should be realistic and respectful
- All ratings should create a coherent social personality
- Consider how their background influences their social patterns`
    },
    {
      role: "user",
      content: `Generate social profiles for: ${basePersona.name} (${basePersona.identity.relationship_status}, ${basePersona.identity.cultural_background}), based on: ${prompt}`
    }
  ];

  const response = await generateChatResponse(messages, OPENAI_API_KEY, {
    model: 'gpt-4.1-2025-04-14',
    temperature: 0.9,
    max_tokens: 1000
  });
  
  const content = response.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse V3 social profiles JSON:', content);
    throw new Error('Invalid JSON response from OpenAI for V3 social profiles');
  }
}

// V3 Runtime Controls Generator
export async function generateRuntimeControls(basePersona: any, prompt: string): Promise<any> {
  console.log(`Generating V3 runtime controls for: ${basePersona.name}`);
  
  const messages = [
    {
      role: "system",
      content: `Generate runtime controls that manage how this persona behaves in conversation. Create realistic parameters for their communication style. Return ONLY valid JSON.

REQUIRED V3 STRUCTURE:
{
  "runtime_controls": {
    "style_weights": {
      "cognition": 0.7,
      "knowledge": 0.8,
      "linguistics": 0.6
    },
    "token_budgets": {
      "max": 300,
      "min": 50
    },
    "variability_profile": {
      "turn_to_turn": 0.3,
      "session_to_session": 0.2
    }
  }
}

DISTINCTIVENESS REQUIREMENTS:
- Style weights should reflect what drives their communication (thinking vs knowledge vs style)
- Token budgets should match their verbosity and communication preferences
- Variability should reflect how consistent vs spontaneous they are
- Parameters should create a unique conversation signature for this persona`
    },
    {
      role: "user",
      content: `Generate runtime controls for: ${basePersona.name} based on their communication style and personality`
    }
  ];

  const response = await generateChatResponse(messages, OPENAI_API_KEY, {
    model: 'gpt-4.1-2025-04-14',
    temperature: 0.7,
    max_tokens: 600
  });
  
  const content = response.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse V3 runtime controls JSON:', content);
    throw new Error('Invalid JSON response from OpenAI for V3 runtime controls');
  }
}

// V3 Export Aliases - matching what index.ts expects
export const generateV3Memory = generateMemory;
export const generateV3StateModifiers = generateStateModifiers;
export const generateV3LinguisticStyle = generateLinguisticStyle;
export const generateV3SocialProfiles = generateSocialProfiles;
export const generateV3RuntimeControls = generateRuntimeControls;