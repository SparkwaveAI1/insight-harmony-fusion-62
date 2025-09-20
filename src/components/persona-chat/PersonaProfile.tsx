
import { useParams } from "react-router-dom";
import { usePersonaDetail } from "@/hooks/usePersonaDetail";
import { V4PersonaDisplay } from "@/components/personas/V4PersonaDisplay";
import Card from "@/components/ui-custom/Card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, Users } from "lucide-react";

const PersonaProfile = () => {
  const { personaId } = useParams<{ personaId: string }>();
  const { persona, isLoading, isOwner } = usePersonaDetail();

  if (isLoading) {
    return (
      <Card className="p-6 sticky top-24">
        <div className="flex flex-col items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Loading persona...</p>
        </div>
      </Card>
    );
  }

  if (!persona) {
    return (
      <Card className="p-6 sticky top-24">
        <div className="flex flex-col items-center justify-center h-48">
          <p className="text-red-500">Failed to load persona</p>
        </div>
      </Card>
    );
  }

  // Check if this is a V4 persona
  if (persona.schema_version === 'v4.0') {
    return (
      <div className="sticky top-24">
        <V4PersonaDisplay
          persona={persona as any}
          isOwner={isOwner}
          onVisibilityChange={async () => {}}
          onPersonaUpdated={async () => {}}
          onDelete={async () => {}}
          onImageGenerated={async () => {}}
        />
      </div>
    );
  }

  // Fallback for legacy personas - use the original hardcoded layout
  const age = persona.conversation_summary?.demographics?.age || (persona.trait_profile as any)?.identity?.age;
  const occupation = persona.conversation_summary?.demographics?.occupation || (persona.trait_profile as any)?.identity?.occupation;
  const location = persona.conversation_summary?.demographics?.location || (persona.trait_profile as any)?.identity?.location?.city;

  return (
    <Card className="p-6 sticky top-24">
      <div className="flex flex-col">
        <div className="text-center mb-6">
          <Avatar className="w-24 h-24 mb-4 mx-auto">
            <AvatarImage src={persona.profile_image_url || "/lovable-uploads/723fa150-405c-4fa6-aa1f-33398c934182.png"} />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-bold mb-2">{persona.name || "Persona"}</h2>
          <p className="text-muted-foreground">{age}-year-old {occupation || "person"}</p>
        </div>
        
        <div className="space-y-6">
          {/* Persona Traits section */}
          <div>
            <h3 className="text-base font-semibold mb-3">Persona Traits</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/30 rounded p-2 text-center">
                <span className="text-xs font-medium">Legacy Persona</span>
              </div>
            </div>
          </div>
          
          {/* Key Information section */}
          <div>
            <h3 className="text-base font-semibold mb-3">Key Information</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Age:</span>
                <span className="font-medium">{age || 'N/A'}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Occupation:</span>
                <span className="font-medium">{occupation || 'N/A'}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Region:</span>
                <span className="font-medium">{location || 'N/A'}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PersonaProfile;
