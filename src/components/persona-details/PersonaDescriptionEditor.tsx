
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";

interface PersonaDescriptionEditorProps {
  personaId: string;
  initialDescription: string;
  onDescriptionUpdate: (description: string) => Promise<void>;
}

export default function PersonaDescriptionEditor({
  personaId,
  initialDescription,
  onDescriptionUpdate
}: PersonaDescriptionEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(initialDescription);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    if (description.trim() === initialDescription.trim()) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      await onDescriptionUpdate(description.trim());
      setIsEditing(false);
      toast.success("Description updated successfully");
    } catch (error) {
      console.error("Error updating description:", error);
      toast.error("Failed to update description");
      setDescription(initialDescription); // Reset on error
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setDescription(initialDescription);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter a description for this persona..."
          className="min-h-[80px] resize-none"
          maxLength={500}
        />
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isUpdating}
            className="h-8"
          >
            <Check className="h-3 w-3 mr-1" />
            Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={isUpdating}
            className="h-8"
          >
            <X className="h-3 w-3 mr-1" />
            Cancel
          </Button>
          <span className="text-xs text-muted-foreground ml-auto">
            {description.length}/500
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative">
      <p className="text-muted-foreground min-h-[40px] leading-relaxed">
        {description || "No description provided."}
      </p>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsEditing(true)}
        className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
      >
        <Pencil className="h-3 w-3" />
      </Button>
    </div>
  );
}
