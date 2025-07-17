
import React, { useState } from 'react';
import { Check, Edit2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateCharacterName } from '../services/characterService';
import { toast } from '@/hooks/use-toast';

interface CharacterNameEditorProps {
  characterId: string;
  currentName: string;
  onNameUpdated: (newName: string) => void;
  className?: string;
}

const CharacterNameEditor = ({ 
  characterId, 
  currentName, 
  onNameUpdated, 
  className = "" 
}: CharacterNameEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentName);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStartEdit = () => {
    setIsEditing(true);
    setName(currentName);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setName(currentName);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Character name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    if (name.trim() === currentName) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      await updateCharacterName(characterId, name.trim());
      onNameUpdated(name.trim());
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Character name updated successfully"
      });
    } catch (error) {
      console.error('Error updating character name:', error);
      toast({
        title: "Error",
        description: "Failed to update character name",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="text-3xl font-bold h-auto py-2"
          disabled={isUpdating}
          autoFocus
        />
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isUpdating}
          className="flex-shrink-0"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          disabled={isUpdating}
          className="flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 group ${className}`}>
      <h1 className="text-3xl font-bold">{currentName}</h1>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleStartEdit}
        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
      >
        <Edit2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default CharacterNameEditor;
