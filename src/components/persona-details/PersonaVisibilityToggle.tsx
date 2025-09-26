
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

  const handleVisibilityChange = async (checkedValue: boolean) => {
    if (isUpdating) return;
    
    console.log("=== VISIBILITY TOGGLE COMPONENT ===");
    console.log("Component personaId:", personaId);
    console.log("Component current isPublic prop:", isPublic);
    console.log("Component isOwner:", isOwner);
    console.log("Switch checkedValue received:", checkedValue);
    
    setIsUpdating(true);
    
    try {
      const newVisibility = checkedValue; // ✅ Use actual Switch value
      console.log("Toggle component requesting newVisibility:", newVisibility);
      
      // ✅ FIXED: Direct database update first
      console.log("Calling updatePersonaVisibility...");
      const success = await updatePersonaVisibility(personaId, newVisibility);
      console.log("Database update result:", success);
      
      if (success) {
        // ✅ THEN: Notify parent component on success
        onVisibilityChange(newVisibility);
        toast.success(`Persona is now ${newVisibility ? 'public' : 'private'}`);
      } else {
        throw new Error('Database update failed');
      }
      
    } catch (error) {
      console.error("Error in toggle component:", error);
      toast.error("Failed to update visibility");
      // ❌ Don't change UI state if database update fails
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center space-x-2 mt-2">
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
