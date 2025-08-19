
import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updatePersonaV2Name } from "@/services/persona";

interface PersonaNameEditorProps {
  personaId: string;
  initialName: string;
  onNameUpdate: (name: string) => void;
}

export default function PersonaNameEditor({ 
  personaId, 
  initialName, 
  onNameUpdate 
}: PersonaNameEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(initialName);
  
  const handleStartEditing = () => {
    setIsEditing(true);
    setNewName(initialName);
  };
  
  const handleSaveName = async () => {
    if (!newName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    
    try {
      await updatePersonaV2Name(personaId, newName);
      toast.success("Persona name updated");
      setIsEditing(false);
      onNameUpdate(newName);
    } catch (error) {
      console.error("Error updating persona name:", error);
      toast.error("An error occurred while updating the name");
    }
  };
  
  const handleCancelEditing = () => {
    setIsEditing(false);
    setNewName(initialName);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveName();
    } else if (e.key === "Escape") {
      handleCancelEditing();
    }
  };
  
  if (isEditing) {
    return (
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={handleKeyPress}
          className="border rounded px-2 py-1 text-xl font-semibold"
          autoFocus
        />
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={handleSaveName}>Save</Button>
          <Button size="sm" variant="ghost" onClick={handleCancelEditing}>Cancel</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2">
      <h1 className="text-xl font-semibold">{initialName}</h1>
      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6"
        onClick={handleStartEditing}
      >
        <Pencil className="h-3 w-3" />
        <span className="sr-only">Edit name</span>
      </Button>
    </div>
  );
}
