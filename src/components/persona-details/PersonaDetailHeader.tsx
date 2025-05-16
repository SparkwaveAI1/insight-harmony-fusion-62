
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Pencil, MessageCircle, Trash, Share2, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import PersonaVisibilityToggle from "./PersonaVisibilityToggle";
import { Persona } from "@/services/persona/types";
import { deletePersona, updatePersonaName } from "@/services/persona";

interface PersonaDetailHeaderProps {
  persona: Persona;
  isOwner: boolean;
  isPublic: boolean;
  onVisibilityChange: (newVisibility: boolean) => void;
  onDelete: () => void;
  onNameUpdate: (name: string) => void;
}

export default function PersonaDetailHeader({ 
  persona, 
  isOwner, 
  isPublic,
  onVisibilityChange,
  onDelete: onPersonaDeleted,
  onNameUpdate: onNameUpdated
}: PersonaDetailHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(persona?.name || "");
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  
  const handleStartEditing = () => {
    setIsEditing(true);
    setNewName(persona.name);
  };
  
  const handleSaveName = async () => {
    if (!newName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    
    try {
      const updated = await updatePersonaName(persona.persona_id, newName);
      if (updated) {
        toast.success("Persona name updated");
        setIsEditing(false);
        onNameUpdated?.(newName);
      } else {
        toast.error("Failed to update persona name");
      }
    } catch (error) {
      console.error("Error updating persona name:", error);
      toast.error("An error occurred while updating the name");
    }
  };
  
  const handleCancelEditing = () => {
    setIsEditing(false);
    setNewName(persona.name);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveName();
    } else if (e.key === "Escape") {
      handleCancelEditing();
    }
  };
  
  const handleDeletePersona = async () => {
    setIsDeleting(true);
    
    try {
      const success = await deletePersona(persona.persona_id);
      if (success) {
        toast.success("Persona deleted successfully");
        onPersonaDeleted?.();
        navigate("/persona-viewer");
      } else {
        toast.error("Failed to delete persona");
      }
    } catch (error) {
      console.error("Error deleting persona:", error);
      toast.error("An error occurred while deleting the persona");
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleChatClick = () => {
    navigate(`/persona/${persona.persona_id}/chat`);
  };
  
  const copyPersonaLink = () => {
    const url = `${window.location.origin}/persona/${persona.persona_id}`;
    navigator.clipboard.writeText(url);
    toast.success("Persona link copied to clipboard");
  };

  if (!persona) {
    return (
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between py-4 gap-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 bg-primary/10 text-primary text-2xl font-bold">
          {persona.profile_image_url ? (
            <AvatarImage src={persona.profile_image_url} alt={persona.name} />
          ) : (
            <AvatarFallback>{persona.name.charAt(0)}</AvatarFallback>
          )}
        </Avatar>
        
        <div>
          {isEditing ? (
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
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{persona.name}</h1>
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
          )}
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            {persona.is_public ? (
              <>
                <Globe className="h-3 w-3" /> Public
              </>
            ) : (
              <>
                <Lock className="h-3 w-3" /> Private
              </>
            )}
          </p>
          <PersonaVisibilityToggle 
            personaId={persona.persona_id} 
            isPublic={isPublic} 
            isOwner={isOwner} 
            onVisibilityChange={onVisibilityChange} 
          />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
        <Button variant="outline" onClick={handleChatClick} className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Chat with Persona
        </Button>
        
        <Button variant="outline" onClick={copyPersonaLink} className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        
        <Button 
          variant="destructive" 
          onClick={handleDeletePersona} 
          disabled={isDeleting}
          className="flex items-center gap-2"
        >
          <Trash className="h-4 w-4" />
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </div>
  );
}
