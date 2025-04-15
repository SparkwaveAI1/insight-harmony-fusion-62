
import { Progress } from "@/components/ui/progress";

const PersonaLoadingState = () => {
  return (
    <div className="text-center py-12">
      <Progress value={75} className="w-64 mx-auto mb-4" />
      <p className="text-muted-foreground">Loading persona details...</p>
    </div>
  );
};

export default PersonaLoadingState;
