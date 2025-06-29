import { TraitProfile } from "@/services/persona/types";

interface PersonaTraitsProps {
  traitProfile: TraitProfile;
}

const PersonaTraits = ({ traitProfile }: PersonaTraitsProps) => {
  console.log("=== PERSONA TRAITS COMPONENT DEBUG ===");
  console.log("Received traitProfile:", traitProfile);
  console.log("TraitProfile type:", typeof traitProfile);
  
  if (!traitProfile) {
    console.error("❌ No trait profile provided to PersonaTraits component");
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-red-600">
          Error: No trait profile data available
        </h2>
        <p className="text-muted-foreground">The trait profile is missing or undefined.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 flex items-center">
        <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
        Persona Psychological Profile
      </h2>
      
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Deep Psychological Understanding
            </h3>
            <p className="text-gray-600 leading-relaxed">
              This persona has been built using advanced psychological modeling that captures the 
              complexity of human behavior, decision-making, and emotional responses. Our comprehensive 
              trait system analyzes multiple dimensions of personality to create an authentic 
              representation that responds naturally to different situations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-gray-800 mb-2">🧠 Cognitive Patterns</h4>
              <p className="text-sm text-gray-600">
                Understands how this persona processes information, makes decisions, and approaches problems 
                based on their unique cognitive style and preferences.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-gray-800 mb-2">💭 Emotional Intelligence</h4>
              <p className="text-sm text-gray-600">
                Captures emotional triggers, responses, and interpersonal dynamics that shape how 
                this persona interacts with others and reacts to different scenarios.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-gray-800 mb-2">🎯 Value System</h4>
              <p className="text-sm text-gray-600">
                Reflects the core values, moral foundations, and cultural influences that guide 
                this persona's choices and worldview.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-gray-800 mb-2">🔄 Behavioral Dynamics</h4>
              <p className="text-sm text-gray-600">
                Models real-world behavioral patterns, social tendencies, and adaptive responses 
                that make interactions feel authentic and predictable.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-6 p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
            <p className="text-sm text-gray-700 font-medium">
              ✨ This psychological depth enables rich, contextual conversations and insights 
              that reflect how this persona would truly think, feel, and respond in real situations.
            </p>
          </div>
        </div>
      </div>
      
      {/* Category Coverage Summary - keeping for technical reference */}
      <details className="mt-4 p-2 bg-gray-50 rounded text-xs">
        <summary className="cursor-pointer font-mono text-gray-500">Technical: Trait Coverage</summary>
        <div className="mt-2 text-gray-600">
          <p>Psychological model includes comprehensive trait analysis across multiple validated frameworks</p>
        </div>
      </details>
    </div>
  );
};

export default PersonaTraits;
