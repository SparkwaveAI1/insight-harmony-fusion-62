
import { Persona } from "@/services/persona/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PersonaDemographics from "./PersonaDemographics";
import PersonaTraits from "./PersonaTraits";
import InterviewResponses from "./InterviewResponses";
import PersonaEmotionalTriggers from "./PersonaEmotionalTriggers";
import PersonaKeyInsights from "./PersonaKeyInsights";

interface PersonaContentProps {
  persona: Persona;
}

const PersonaContent = ({ persona }: PersonaContentProps) => {
  console.log("=== PERSONA CONTENT COMPONENT DEBUG ===");
  console.log("Full persona object:", persona);
  console.log("Persona name:", persona.name);
  console.log("Persona ID:", persona.persona_id);
  console.log("Trait profile exists:", !!persona.trait_profile);
  console.log("Trait profile type:", typeof persona.trait_profile);
  console.log("Trait profile content:", persona.trait_profile);
  
  // Debug metadata display issues
  console.log("=== DEMOGRAPHICS DEBUG ===");
  console.log("Metadata exists:", !!persona.metadata);
  console.log("Metadata type:", typeof persona.metadata);
  console.log("Metadata content:", persona.metadata);
  
  // Debug emotional triggers display issues
  console.log("=== EMOTIONAL TRIGGERS DEBUG ===");
  console.log("Emotional triggers exists:", !!persona.emotional_triggers);
  console.log("Emotional triggers type:", typeof persona.emotional_triggers);
  console.log("Emotional triggers content:", persona.emotional_triggers);
  
  if (persona.trait_profile) {
    console.log("=== TRAIT PROFILE BREAKDOWN ===");
    console.log("big_five:", persona.trait_profile.big_five);
    console.log("moral_foundations:", persona.trait_profile.moral_foundations);
    console.log("world_values:", persona.trait_profile.world_values);
    console.log("political_compass:", persona.trait_profile.political_compass);
    console.log("cultural_dimensions:", persona.trait_profile.cultural_dimensions);
    console.log("social_identity:", persona.trait_profile.social_identity);
    console.log("behavioral_economics:", persona.trait_profile.behavioral_economics);
    console.log("extended_traits:", persona.trait_profile.extended_traits);
  } else {
    console.error("❌ CRITICAL: No trait_profile in persona object!");
  }

  // Process interview sections to ensure proper format
  const processedInterviewSections = Array.isArray(persona.interview_sections) 
    ? persona.interview_sections 
    : persona.interview_sections?.interview_sections || [];

  return (
    <div className="mt-8">
      <Tabs defaultValue="demographics" className="w-full">
        <TabsList className="grid grid-cols-5 w-full mb-8">
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="traits">
            Traits
            {!persona.trait_profile && <span className="text-red-500 ml-1">❌</span>}
          </TabsTrigger>
          <TabsTrigger value="interview">Interview</TabsTrigger>
          <TabsTrigger value="triggers">Triggers</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="demographics" className="space-y-6">
          <PersonaDemographics metadata={persona.metadata} />
        </TabsContent>

        <TabsContent value="traits" className="space-y-6">
          {persona.trait_profile ? (
            <PersonaTraits traitProfile={persona.trait_profile} />
          ) : (
            <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-xl font-semibold text-red-600 mb-2">❌ No Trait Profile</h3>
              <p className="text-red-600">
                This persona is missing trait profile data. This indicates a generation failure.
              </p>
              <details className="mt-4 text-left">
                <summary className="cursor-pointer font-mono text-sm">Debug: Full Persona Object</summary>
                <pre className="mt-2 text-xs overflow-auto max-h-40 bg-white p-2 rounded border">
                  {JSON.stringify(persona, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </TabsContent>

        <TabsContent value="interview" className="space-y-6">
          <InterviewResponses 
            sections={processedInterviewSections} 
            personaName={persona.name}
          />
        </TabsContent>

        <TabsContent value="triggers" className="space-y-6">
          <PersonaEmotionalTriggers emotionalTriggers={persona.emotional_triggers} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <PersonaKeyInsights metadata={persona} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PersonaContent;
