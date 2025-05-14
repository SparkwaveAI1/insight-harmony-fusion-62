import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

// Define persona template structure
const personaTemplate = {
  persona_id: '',
  name: '',
  creation_date: '',
  metadata: {
    // Core Demographics
    age: null,
    gender: null,
    race_ethnicity: null,
    sexual_orientation: null,
    education_level: null,
    occupation: null,
    employment_type: null,
    income_level: null,
    social_class_identity: null,
    marital_status: null,
    parenting_role: null,
    relationship_history: null,
    military_service: null,
    
    // Location, Environment & Migration
    region: null,
    urban_rural_context: null,
    location_history: {
      grew_up_in: null,
      current_residence: null,
      places_lived: [],
    },
    migration_history: null,
    climate_risk_zone: null,
    
    // Cognitive, Psychological, and Cultural
    language_proficiency: [],
    religious_affiliation: null,
    religious_practice_level: null,
    cultural_background: null,
    cultural_affiliation: [],
    political_affiliation: null,
    political_sophistication: null,
    tech_familiarity: null,
    learning_modality: null,
    trust_in_institutions: null,
    trauma_exposure: null,
    
    // Financial and Time Resource Profile
    financial_pressure: null,
    credit_access: null,
    debt_load: null,
    time_abundance: null,
    
    // Digital Ecosystem & Signaling Behavior
    media_ecosystem: [],
    aesthetic_subculture: null,
    
    // Health-Related Attributes
    physical_health_status: null,
    mental_health_status: null,
    health_prioritization: null,
    healthcare_access: null,
    
    // Knowledge Domains - Added
    knowledge_domains: {
      finance_basics: null,
      crypto_blockchain: null,
      world_politics: null,
      national_politics: null,
      pop_culture: null,
      basic_technology: null,
      deep_technology: null,
      health_medicine: null,
      advanced_medical: null,
      science_concepts: null,
      sports: null,
      news_literacy: null,
      environmental_issues: null,
      cultural_history: null,
      law_legal: null,
      religion_spirituality: null,
      art_literature: null,
      gaming: null,
      food_cooking: null,
      travel_geography: null,
      parenting_childcare: null,
      home_improvement: null,
      business_entrepreneurship: null,
      psychology_social_science: null,
      economics: null,
    },
  },
  trait_profile: {
    big_five: {
      openness: null,
      conscientiousness: null,
      extraversion: null,
      agreeableness: null,
      neuroticism: null,
    },
    moral_foundations: {
      care: null,
      fairness: null,
      loyalty: null,
      authority: null,
      sanctity: null,
      liberty: null,
    },
    world_values: {
      traditional_vs_secular: null,
      survival_vs_self_expression: null,
    },
    political_compass: {
      economic: null,
      authoritarian_libertarian: null,
    },
    behavioral_economics: {
      present_bias: null,
      loss_aversion: null,
      overconfidence: null,
      risk_sensitivity: null,
    },
    extended_traits: {
      truth_orientation: null,
      moral_consistency: null,
      self_awareness: null,
      empathy: null,
      self_efficacy: null,
      manipulativeness: null,
      impulse_control: null,
      shadow_trait_activation: null,
      attention_pattern: null,
      cognitive_load_resilience: null,
    },
  },
  behavioral_modulation: {
    cognitive_load_pattern: null,
    attention_regulation: null,
    emotional_reactivity: null,
    stress_behavior: null,
    fatigue_pattern: null,
    physical_health_consideration: null,
    trust_behavior_under_strain: null,
    coping_mechanisms: null,
  },
  linguistic_profile: {
    default_output_length: "moderate",
    speech_register: "hybrid",
    regional_influence: null,
    professional_or_educational_influence: null,
    cultural_speech_patterns: null,
    generational_or_peer_influence: null,
    speaking_style: {
      uses_neutral_fillers: true,
      sentence_revisions: true,
      topic_length_variability: true,
      contradiction_tolerance: true,
      trust_modulated_tone: true,
      mirroring_tendency: true,
    },
    sample_phrasing: [],
  },
  preinterview_tags: [],
  simulation_directives: {
    encourage_contradiction: true,
    emotional_asymmetry: true,
    stress_behavior_expected: true,
    inconsistency_is_valid: true,
    response_length_variability: true,
  },
};

// Standard sections and questions for interview
const interviewSections = [
  {
    section: "Introduction & Tone Calibration",
    notes: "Use open-ended, low-pressure prompts to establish persona's speech style and default rhythm.",
    questions: [
      "What's something you've been thinking about lately?",
      "What's something that recently made you pause or think twice?",
      "What kind of mood have you been in this week?",
    ],
  },
  {
    section: "Daily Life & Rhythms",
    notes: "Let tone drift naturally. Accept tangents, task switching, and emotional leakage.",
    questions: [
      "What's your typical day look like right now?",
      "What time of day do you feel most like yourself?",
      "What throws off your rhythm?",
      "What's something small that helps your day feel better?",
    ],
  },
  {
    section: "Childhood & Growing Up",
    notes: "Watch for emotional compression or expansion. People may skip, stall, or flood.",
    questions: [
      "Where did you grow up?",
      "What was your household like?",
      "What do you remember clearly from that time?",
      "Did you feel understood by the adults around you?",
    ],
  },
  {
    section: "Relationships",
    notes: "Response length varies depending on trust style. Look for quiet care or guarded phrasing.",
    questions: [
      "Who do you talk to most in your life right now?",
      "Who really gets you?",
      "Do you ask for support when you need it?",
      "Have you let go of relationships that no longer fit?",
    ],
  },
  {
    section: "Health & Coping",
    notes: "Expect quick shifts from surface to depth. Track routines, avoidance, and naming behaviors.",
    questions: [
      "How do you take care of yourself, mentally or physically?",
      "How do you know when something's off?",
      "What helps you reset when you're stressed?",
      "Do you ever share when you're not okay?",
    ],
  },
  {
    section: "Work & Ambition",
    notes: "Some personas open up here; others deflect. Let ambition be emotional or logistical.",
    questions: [
      "How do you feel about the work you do?",
      "What kind of work would feel closer to what you want?",
      "What does success look like to you?",
      "Do you think of yourself as ambitious?",
    ],
  },
  {
    section: "Financial Behavior",
    notes: "Include memory, friction, shame, or pride. Money is rarely a neutral topic.",
    questions: [
      "How do you manage your money?",
      "What kind of spending feels ‘worth it’ to you?",
      "Do you take financial risks?",
      "What's one money decision you second-guessed?",
    ],
  },
  {
    section: "Politics & Institutions",
    notes: "Don’t force ideology. Let disillusionment, fatigue, or contradiction show.",
    questions: [
      "How do you feel about politics in general?",
      "Do you vote? Why or why not?",
      "Do you trust institutions—government, media, healthcare?",
      "What kinds of political messages push you away?",
    ],
  },
  {
    section: "Technology & Media",
    notes: "Look for attention drift, digital hygiene, and relationship to algorithmic space.",
    questions: [
      "How do you use your phone throughout the day?",
      "What apps or platforms do you trust most right now?",
      "Do you feel overwhelmed by digital stuff sometimes?",
      "What kind of content actually holds your attention?",
    ],
  },
  {
    section: "Decision-Making & Reflection",
    notes: "Follow logic vs. emotion tension. Include hesitations and second-guessing.",
    questions: [
      "How do you usually make decisions?",
      "What helps you move forward when you're stuck?",
      "Have you ever made a hard decision that still feels right?",
      "Do you tend to rely on logic or instinct?",
    ],
  },
  {
    section: "Moral & Ethical Framework",
    notes: "Let moral tension show up subtly—via phrasing, delay, or framing conflicts.",
    questions: [
      "Are there values you try to live by?",
      "Where do those come from?",
      "Have you ever walked away from something on principle?",
      "Do you think people can change?",
    ],
  },
  {
    section: "Cultural Identity & Positioning",
    notes: "Make room for ambiguity, misfit, hybridity. Avoid forcing identity labels.",
    questions: [
      "Do you feel like you fit in where you live?",
      "How do you relate to your generation or background?",
      "Do you ever feel misunderstood culturally or socially?",
      "What's something people often assume about you that isn't true?",
    ],
  },
  {
    section: "Future Vision & Aspiration",
    notes: "Expect idealism, realism, and contradiction to coexist.",
    questions: [
      "What would a really good year look like for you?",
      "What are you trying to create—personally or professionally?",
      "What's something you keep putting off?",
      "How do you want to be remembered?",
    ],
  },
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      console.error("OPENAI_API_KEY is not configured in environment variables");
      throw new Error("OPENAI_API_KEY is not configured in environment variables");
    }

    const requestData = await req.json().catch(() => ({}));
    const { prompt, userId } = requestData; // Extract userId if available
    
    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      console.error("Valid prompt is required");
      throw new Error("Valid prompt is required");
    }

    console.log("Generating persona from prompt:", prompt);
    if (userId) {
      console.log("Creating for user:", userId);
    }

    // Step 1: Generate basic persona traits
    const traitsResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: `You are an AI specialized in creating realistic personas for research. 
            Given a brief description, generate a detailed psychological and demographic profile following the template exactly.
            You should fill in all the demographic fields in the metadata section, creating a rich and nuanced profile.
            Fill in the trait_profile completely with accurate, realistic trait assessments.
            Use realistic values based on demographic probability distributions.
            Maintain internal consistency while allowing for realistic contradictions.
            Return the output as valid JSON matching the provided template exactly.` 
          },
          { 
            role: "user", 
            content: `Create a realistic persona based on this description: "${prompt}".
            Fill in all the values according to the template structure below. Return ONLY the JSON data, no markdown formatting.
            ${JSON.stringify(personaTemplate, null, 2)}` 
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!traitsResponse.ok) {
      const errorData = await traitsResponse.text();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${traitsResponse.status}`);
    }

    const traitsData = await traitsResponse.json();
    
    if (!traitsData.choices || !traitsData.choices[0] || !traitsData.choices[0].message) {
      console.error("Invalid response from OpenAI:", traitsData);
      throw new Error("Invalid response from OpenAI");
    }
    
    let personaTraits;
    try {
      const content = traitsData.choices[0].message.content;
      // Try to extract JSON if wrapped in markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonContent = jsonMatch ? jsonMatch[1] : content;
      
      personaTraits = JSON.parse(jsonContent);
      console.log("Successfully parsed persona traits");
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      console.error("Raw content:", traitsData.choices[0].message.content);
      throw new Error("Failed to parse persona data from OpenAI response");
    }
    
    // Add creation date and unique ID
    personaTraits.creation_date = new Date().toISOString().split('T')[0];
    personaTraits.persona_id = crypto.randomUUID().substring(0, 8);
    
    // Add interview sections with placeholder for responses
    const interviewSectionsWithEmptyResponses = interviewSections.map(section => ({
      ...section,
      questions: section.questions.map(question => ({
        question,
        response: "" // Empty response placeholder
      }))
    }));
    
    personaTraits.interview_sections = interviewSectionsWithEmptyResponses;

    // Step 2: Generate interview responses based on the persona
    const interviewResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: `You are an AI that simulates interviews for realistic personas. 
            Given a persona definition, generate plausible responses to the preset interview questions 
            that match the persona's characteristics, traits, and speaking style.
            Ensure responses reflect the persona's demographic information and psychological traits.
            Include behavioral inconsistencies where appropriate.
            For each question in each section, provide a response in the "response" field of each question object.` 
          },
          { 
            role: "user", 
            content: `Generate plausible interview responses for this persona:
            ${JSON.stringify(personaTraits, null, 2)}
            
            For each question in each interview section, add a realistic response that this persona would give.
            Return the complete interview_sections array with the responses added as JSON, no markdown formatting.` 
          }
        ],
        temperature: 0.8,
      }),
    });

    if (!interviewResponse.ok) {
      const errorData = await interviewResponse.text();
      console.error("OpenAI API error (interview):", errorData);
      throw new Error(`OpenAI API error: ${interviewResponse.status}`);
    }

    const interviewData = await interviewResponse.json();
    
    try {
      const content = interviewData.choices[0].message.content;
      // Try to extract JSON if wrapped in markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonContent = jsonMatch ? jsonMatch[1] : content;
      
      const parsedResponse = JSON.parse(jsonContent);
      console.log("Successfully parsed interview responses");
      
      // Update the persona with the interview responses
      if (Array.isArray(parsedResponse)) {
        // Response is directly the interview_sections array
        personaTraits.interview_sections = parsedResponse;
      } else if (parsedResponse.interview_sections && Array.isArray(parsedResponse.interview_sections)) {
        // Response has the interview_sections property
        personaTraits.interview_sections = parsedResponse.interview_sections;
      } else {
        console.error("Unexpected format for interview responses:", parsedResponse);
      }
      
      console.log("Updated persona with interview responses");
    } catch (e) {
      console.error("Error parsing interview responses:", e);
      console.error("Raw content:", interviewData.choices[0].message.content);
      // If parsing fails, keep the original interview sections without responses
    }

    console.log("Returning generated persona");
    return new Response(
      JSON.stringify({
        success: true,
        persona: personaTraits
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating persona:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to generate persona",
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
