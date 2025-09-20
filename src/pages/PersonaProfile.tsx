import { useParams } from "react-router-dom";
import { usePersonaDetail } from "@/hooks/usePersonaDetail";
import { V4PersonaDisplay } from "@/components/personas/V4PersonaDisplay";
import Card from "@/components/ui-custom/Card";

const PersonaProfile = () => {
  const { personaId } = useParams<{ personaId: string }>();
  const { persona, isLoading, isOwner, handleVisibilityChange, handlePersonaUpdated, handlePersonaDeleted, handleImageGenerated } = usePersonaDetail();

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

  // Always use V4PersonaDisplay for all personas
  return (
    <V4PersonaDisplay
      persona={persona as any}
      isOwner={isOwner}
      onVisibilityChange={handleVisibilityChange}
      onPersonaUpdated={handlePersonaUpdated}
      onDelete={handlePersonaDeleted}
      onImageGenerated={handleImageGenerated}
    />
  );
};

export default PersonaProfile;