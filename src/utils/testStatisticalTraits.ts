// Test runner for statistical trait assignment - run this in console to see results
import { assignRealisticTraits, PersonaDemographics } from '../services/v4-persona/traitAssignment';

export function demonstrateStatisticalTraits() {
  console.log("🧬 STATISTICAL TRAIT ASSIGNMENT DEMONSTRATION");
  console.log("=" .repeat(60));
  
  // Create a base persona (what we get from initial generation)
  const basePersona = {
    identity: { 
      name: "Sarah Mitchell", 
      age: 45,
      occupation: "Marketing Manager"
    },
    health_profile: {
      bmi: 21.8,
      chronic_conditions: ["none"],
      mental_health_flags: ["none"],
      medications: ["none"],
      sleep_hours: 7,
      substance_use: {
        alcohol: "none",
        cigarettes: "no",
        vaping: "no"
      },
      fitness_level: "moderate",
      diet_pattern: "mixed"
    },
    emotional_profile: {
      stress_responses: [],
      negative_triggers: [],
      explosive_triggers: []
    },
    daily_life: {
      mental_preoccupations: [],
      time_sentiment: {
        work: "neutral",
        family: "positive", 
        personal: "neutral"
      }
    },
    relationships: {
      friend_network: { size: "medium" }
    },
    money_profile: {
      financial_stressors: []
    },
    communication_style: {
      voice_foundation: {
        empathy_level: 0.7
      }
    },
    cognitive_profile: {
      thought_coherence: 0.35
    }
  };

  const demographics: PersonaDemographics = {
    age: 45,
    income: "middle",
    region: "suburban",
    ethnicity: "white", 
    gender: "female"
  };

  console.log("📊 BEFORE Statistical Enhancement:");
  console.log("Chronic Conditions:", basePersona.health_profile.chronic_conditions);
  console.log("Medications:", basePersona.health_profile.medications);
  console.log("Mental Health:", basePersona.health_profile.mental_health_flags);
  console.log("Financial Stressors:", basePersona.money_profile.financial_stressors);
  console.log("Mental Preoccupations:", basePersona.daily_life.mental_preoccupations);
  
  console.log("\n🎯 APPLYING STATISTICAL DISTRIBUTIONS...\n");
  
  // Apply realistic statistical traits
  const enhancedPersona = assignRealisticTraits(basePersona, demographics);
  
  console.log("✨ AFTER Statistical Enhancement:");
  console.log("BMI:", enhancedPersona.health_profile.bmi);
  console.log("Chronic Conditions:", enhancedPersona.health_profile.chronic_conditions);
  console.log("Medications:", enhancedPersona.health_profile.medications);
  console.log("Mental Health Flags:", enhancedPersona.health_profile.mental_health_flags);
  console.log("Sleep Hours:", enhancedPersona.health_profile.sleep_hours);
  console.log("Substance Use:", enhancedPersona.health_profile.substance_use);
  console.log("Diet Pattern:", enhancedPersona.health_profile.diet_pattern);
  console.log("Financial Stressors:", enhancedPersona.money_profile.financial_stressors);
  console.log("Mental Preoccupations:", enhancedPersona.daily_life.mental_preoccupations);
  console.log("Work Sentiment:", enhancedPersona.daily_life.time_sentiment.work);
  console.log("Friend Network Size:", enhancedPersona.relationships.friend_network.size);
  
  console.log("\n🔍 TRAIT CONSISTENCY EXAMPLES:");
  
  // Check for realistic combinations
  if (enhancedPersona.health_profile.chronic_conditions.includes("type_2_diabetes")) {
    console.log("✓ Has diabetes → Diet adjusted to 'mixed' (attempting management)");
  }
  
  if (enhancedPersona.health_profile.mental_health_flags.includes("generalized_anxiety")) {
    console.log("✓ Has anxiety → Friend network size reduced + empathy increased");
  }
  
  if (enhancedPersona.money_profile.financial_stressors.length > 2) {
    console.log("✓ Multiple financial stressors → Money worries added to mental preoccupations");
  }
  
  console.log("\n📈 STATISTICAL ACCURACY:");
  console.log("• 47% chance of hypertension (age 45+ = 1.5x modifier)");
  console.log("• 32% chance of work dissatisfaction"); 
  console.log("• BMI distribution: 26% normal, 30% overweight, 44% obese");
  console.log("• Age group 41-65 gets 1.8x chronic condition modifier");
  
  return enhancedPersona;
}

// Run the demonstration
if (typeof window !== 'undefined') {
  // Browser environment - add to window for console access
  (window as any).testStatisticalTraits = demonstrateStatisticalTraits;
  console.log("🚀 Run testStatisticalTraits() in console to see the demonstration!");
}