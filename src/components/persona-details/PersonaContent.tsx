
import { Persona } from "@/services/persona/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Legacy components removed - V4 personas use V4PersonaDisplay
import PersonaKeyInsights from "./PersonaKeyInsights";
import { SurveyManagement } from '../surveys/SurveyManagement';
import { V4PersonaDisplay } from '../personas/V4PersonaDisplay';
import { detectPersonaVersion, isV4Persona } from '@/utils/personaDetection';

interface PersonaContentProps {
  persona: Persona;
  isOwner?: boolean;
}

interface InterviewResponse {
  question: string;
  answer: string;
}

interface InterviewSection {
  section_title: string;
  responses: InterviewResponse[];
}

const PersonaContent = ({ persona, isOwner = false }: PersonaContentProps) => {
  console.log("=== PERSONA CONTENT COMPONENT DEBUG ===");
  console.log("Full persona object:", persona);
  console.log("Persona name:", persona.name);
  console.log("Persona ID:", persona.persona_id);
  
  // Detect persona version
  const versionInfo = detectPersonaVersion(persona);
  console.log("Detected persona version:", versionInfo);
  
  // If this is a V4 persona, use the V4 display component
  if (versionInfo.isV4 && isV4Persona(persona)) {
    return <V4PersonaDisplay persona={persona} isOwner={isOwner} />;
  }
  
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

  // Fix interview sections type compatibility
  const processedInterviewSections: InterviewSection[] = Array.isArray(persona.interview_sections) 
    ? persona.interview_sections.map(section => {
        // Handle both old and new interview section formats
        if (typeof section === 'object' && section !== null) {
          if ('section_title' in section && 'responses' in section) {
            // New format with proper structure - ensure section_title is a string
            return {
              section_title: String(section.section_title || "Interview Section"),
              responses: Array.isArray(section.responses) 
                ? section.responses.map((response: any) => {
                    if (typeof response === 'string') {
                      return { question: "Response", answer: response };
                    }
                    return {
                      question: String(response?.question || "Question"),
                      answer: String(response?.answer || "")
                    };
                  })
                : []
            };
          }
        }
        
        // Fallback for any unexpected format
        return {
          section_title: "Interview Section",
          responses: [
            {
              question: "Tell me about yourself",
              answer: String(section)
            }
          ]
        };
      })
    : [];

  // Legacy V1/V2/V3 personas no longer supported
  return (
    <div className="mt-8">
      <div className="text-center p-8 bg-amber-50 border border-amber-200 rounded-lg">
        <h3 className="text-xl font-semibold text-amber-600 mb-2">Legacy Persona Format</h3>
        <p className="text-amber-600 mb-4">
          This persona uses an older format that is no longer supported. Please create a new V4 persona.
        </p>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Available tabs:</p>
            <Tabs defaultValue="insights" className="w-full mt-4">
              <TabsList className="grid grid-cols-2 w-full mb-4">
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="surveys">Surveys</TabsTrigger>
              </TabsList>

              <TabsContent value="insights" className="space-y-6">
                <PersonaKeyInsights metadata={persona} />
              </TabsContent>
              
              <TabsContent value="surveys" className="space-y-6">
                <SurveyManagement 
                  personaId={persona.persona_id} 
                  isOwner={isOwner}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonaContent;
