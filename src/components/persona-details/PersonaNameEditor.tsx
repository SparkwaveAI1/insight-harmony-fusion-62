
import { useState } from "react";
import { Check, Pen, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { updatePersonaName } from "@/services/persona";

interface PersonaNameEditorProps {
  personaId: string;
  initialName: string;
  onNameUpdate?: (name: string) => void;
  className?: string;
}

export default function PersonaNameEditor({
  personaId,
  initialName,
  onNameUpdate,
  className
}: PersonaNameEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [originalName] = useState(initialName);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setName(originalName);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (name.trim() === "") {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      await updatePersonaName(personaId, name);
      onNameUpdate?.(name);
      setIsEditing(false);
      toast.success("Name updated successfully");
    } catch (error) {
      console.error("Failed to update name:", error);
      toast.error("Failed to update name");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
          autoFocus
        />
        <button
          onClick={handleSave}
          className="p-1.5 bg-green-50 text-green-600 rounded-full hover:bg-green-100"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={handleCancel}
          className="p-1.5 bg-red-50 text-red-600 rounded-full hover:bg-red-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <h1 className={cn("font-medium", className)}>
        {name}
      </h1>
      <button
        onClick={handleEdit}
        className="p-1 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
      >
        <Pen className="w-4 h-4" />
      </button>
    </div>
  );
}
