import { assignRealisticTraits, testRealisticTraits, PersonaDemographics } from './traitAssignment';

// Test the trait assignment system
export function runTraitAssignmentTest() {
  console.log("=== Testing Realistic Trait Assignment ===\n");
  
  // Test 1: Young adult (high anxiety/depression risk)
  console.log("Test 1: Young Adult (22 years old)");
  const youngAdult = createTestPersona();
  const youngDemographics: PersonaDemographics = {
    age: 22,
    income: "low",
    region: "urban",
    ethnicity: "hispanic",
    gender: "female"
  };
  
  const enhancedYoung = assignRealisticTraits(youngAdult, youngDemographics);
  console.log("Health Profile:", JSON.stringify(enhancedYoung.health_profile, null, 2));
  console.log("Financial Stressors:", enhancedYoung.money_profile.financial_stressors);
  console.log("Mental Preoccupations:", enhancedYoung.daily_life.mental_preoccupations);
  console.log("\n" + "=".repeat(50) + "\n");
  
  // Test 2: Middle-aged adult (chronic conditions risk)
  console.log("Test 2: Middle-aged Adult (52 years old)");
  const middleAged = createTestPersona();
  const middleDemographics: PersonaDemographics = {
    age: 52,
    income: "middle",
    region: "suburban",
    ethnicity: "white",
    gender: "male"
  };
  
  const enhancedMiddle = assignRealisticTraits(middleAged, middleDemographics);
  console.log("Health Profile:", JSON.stringify(enhancedMiddle.health_profile, null, 2));
  console.log("Medications:", enhancedMiddle.health_profile.medications);
  console.log("Work Sentiment:", enhancedMiddle.daily_life.time_sentiment.work);
  console.log("\n" + "=".repeat(50) + "\n");
  
  // Test 3: Older adult (multiple conditions)
  console.log("Test 3: Older Adult (68 years old)");
  const older = createTestPersona();
  const olderDemographics: PersonaDemographics = {
    age: 68,
    income: "fixed",
    region: "rural",
    ethnicity: "white",
    gender: "female"
  };
  
  const enhancedOlder = assignRealisticTraits(older, olderDemographics);
  console.log("Health Profile:", JSON.stringify(enhancedOlder.health_profile, null, 2));
  console.log("Chronic Conditions:", enhancedOlder.health_profile.chronic_conditions);
  console.log("Sleep Hours:", enhancedOlder.health_profile.sleep_hours);
  console.log("\n" + "=".repeat(50) + "\n");
  
  // Test consistency checks
  console.log("=== Consistency Check Examples ===");
  console.log("If diabetes + poor diet -> diet becomes 'mixed' (management attempt)");
  console.log("If anxiety -> friend network becomes 'small' + higher empathy");
  console.log("If chronic pain -> fitness level becomes 'low'");
  console.log("If multiple financial stressors -> adds mental preoccupations");
  
  return {
    youngAdult: enhancedYoung,
    middleAged: enhancedMiddle,
    older: enhancedOlder
  };
}

function createTestPersona() {
  return {
    identity: { name: "Test Person" },
    health_profile: {
      bmi: 24.2,
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
      thought_coherence: 0.8
    }
  };
}

// Run the test immediately when this file is imported
console.log("🧬 Testing Statistical Trait Assignment System");
const testResults = runTraitAssignmentTest();
console.log("✅ Trait assignment test completed!");