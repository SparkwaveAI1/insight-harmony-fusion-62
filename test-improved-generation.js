// Test improved persona generation with debugging
const SUPABASE_URL = "https://wgerdrdsuusnrdnwwelt.supabase.co";

async function testImprovedGeneration() {
  try {
    console.log("🧪 Testing improved persona generation...");
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-persona`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZXJkcmRzdXVzbnJkbnd3ZWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxODkxMjAsImV4cCI6MjA1Nzc2NTEyMH0.yAoqtSbNo7gabNOSyDrNGNjIUaMIPwyhevV2F-IQHbY'
      },
      body: JSON.stringify({
        prompt: "Ethan Kaplan, 32-year-old web developer from Brooklyn, works as a senior frontend developer at a tech startup"
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Generation Response:", JSON.stringify(data, null, 2));
    
    if (data.success && data.persona) {
      // Check for improved traits
      const cognitive = data.persona.persona_data?.cognitive_profile;
      if (cognitive?.big_five) {
        console.log("\n🧠 BIG FIVE TRAITS:");
        Object.entries(cognitive.big_five).forEach(([trait, value]) => {
          const status = value === 0.5 ? "⚠️ DEFAULT" : "✅ CUSTOM";
          console.log(`  ${trait}: ${value} ${status}`);
        });
        
        // Check if we've overcome the default value issue
        const allDefault = Object.values(cognitive.big_five).every(v => v === 0.5);
        console.log(`\n🎯 Result: ${allDefault ? "❌ STILL DEFAULTS" : "✅ DISTINCTIVE TRAITS"}`);
      }
      
      // Check emotional triggers location
      const triggers = data.persona.persona_data?.state_modifiers?.emotional_triggers;
      console.log(`\n🎭 Emotional triggers: ${triggers ? "✅ Found in state_modifiers" : "❌ Missing"}`);
      
      // Check identity structure
      const identity = data.persona.persona_data?.identity;
      console.log(`\n👤 Identity structure: ${identity?.age && identity?.occupation ? "✅ Complete" : "❌ Incomplete"}`);
      
    } else {
      console.error("❌ Generation failed:", data.error);
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testImprovedGeneration();