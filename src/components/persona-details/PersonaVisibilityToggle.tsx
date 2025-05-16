
import { useState } from "react";
import { Globe, Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { updatePersonaVisibility } from "@/services/persona";

interface PersonaVisibilityToggleProps {
  personaId: string;
  isPublic: boolean;
  isOwner: boolean;
  onVisibilityChange: (isPublic: boolean) => void;
}

const PersonaVisibilityToggle = ({ 
  personaId, 
  isPublic, 
  isOwner, 
  onVisibilityChange 
}: PersonaVisibilityToggleProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  
  if (!isOwner) return null;

  const handleVisibilityChange = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    
    try {
      const newVisibility = !isPublic;
      const success = await updatePersonaVisibility(personaId, newVisibility);
      
      if (success) {
        onVisibilityChange(newVisibility);
        toast.success(`Persona is now ${newVisibility ? 'public' : 'private'}`);
      } else {
        toast.error("Failed to update visibility");
      }
    } catch (error) {
      console.error("Error updating visibility:", error);
      toast.error("Failed to update visibility");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center space-x-2 mt-4">
      <div className="flex items-center space-x-2">
        <Switch 
          id="visibility-toggle" 
          checked={isPublic}
          onCheckedChange={handleVisibilityChange}
          disabled={isUpdating}
        />
        <label 
          htmlFor="visibility-toggle" 
          className="text-sm font-medium cursor-pointer flex items-center"
        >
          {isPublic ? (
            <>
              <Globe className="w-4 h-4 mr-1 text-green-500" />
              <span>Public</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-1 text-amber-500" />
              <span>Private</span>
            </>
          )}
        </label>
      </div>
      <span className="text-xs text-muted-foreground">
        {isPublic 
          ? "This persona is visible to everyone" 
          : "Only you can see this persona"}
      </span>
    </div>
  );
};

export default PersonaVisibilityToggle;
