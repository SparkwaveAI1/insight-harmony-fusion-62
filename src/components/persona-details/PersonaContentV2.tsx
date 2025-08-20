import { DbPersonaV2 } from "@/services/persona/types/persona-v2-db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PersonaDemographicsV2 from "./PersonaDemographicsV2";
import PersonaTraitsSummaryV2 from "./PersonaTraitsSummaryV2";
import PersonaInterviewV2 from "./PersonaInterviewV2";
import { SurveyManagement } from '../surveys/SurveyManagement';

interface PersonaContentV2Props {
  persona: DbPersonaV2;
  isOwner?: boolean;
}

const PersonaContentV2 = ({ persona, isOwner = false }: PersonaContentV2Props) => {
  return (
    <div className="mt-8">
      <Tabs defaultValue="demographics" className="w-full">
        <TabsList className="grid grid-cols-4 w-full mb-8">
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="traits">Traits & Behavior</TabsTrigger>
          <TabsTrigger value="interview">Interview</TabsTrigger>
          <TabsTrigger value="surveys">Surveys</TabsTrigger>
        </TabsList>

        <TabsContent value="demographics" className="space-y-6">
          <PersonaDemographicsV2 persona={persona} />
        </TabsContent>

        <TabsContent value="traits" className="space-y-6">
          <PersonaTraitsSummaryV2 persona={persona} />
        </TabsContent>

        <TabsContent value="interview" className="space-y-6">
          <PersonaInterviewV2 persona={persona} />
        </TabsContent>
        
        <TabsContent value="surveys" className="space-y-6">
          <SurveyManagement 
            personaId={persona.persona_id} 
            isOwner={isOwner}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PersonaContentV2;