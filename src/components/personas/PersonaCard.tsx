
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, MoreHorizontal } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { updatePersonaVisibility } from "@/services/persona"; 
import { Persona } from "@/services/persona/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DeletePersonaDialog from "./DeletePersonaDialog";
import AddToCollectionButton from "./AddToCollectionButton";

interface PersonaCardProps {
  persona: Persona;
  onVisibilityChange?: (personaId: string, isPublic: boolean) => void;
  onDelete?: (personaId: string) => void;
}

const PersonaCard: React.FC<PersonaCardProps> = ({ persona, onVisibilityChange, onDelete }) => {
  const { user } = useAuth();
  const isOwner = user?.id === persona.user_id;
  const [isPublic, setIsPublic] = useState(persona.is_public);

  const handleVisibilityChange = async () => {
    if (!isOwner) {
      return;
    }

    const newVisibility = !isPublic;
    try {
      const success = await updatePersonaVisibility(persona.persona_id, newVisibility);
      if (success) {
        setIsPublic(newVisibility);
        if (onVisibilityChange) {
          onVisibilityChange(persona.persona_id, newVisibility);
        }
      } else {
        console.error("Failed to update persona visibility");
      }
    } catch (error) {
      console.error("Error updating persona visibility:", error);
    }
  };

  return (
    <Card className="bg-card text-card-foreground shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col space-y-1">
          <Link to={`/persona-detail/${persona.persona_id}`}>
            <div className="text-sm font-medium">{persona.name}</div>
          </Link>
          <p className="text-xs text-muted-foreground">
            Created: {persona.creation_date}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/persona-detail/${persona.persona_id}`}>
                View Details
              </Link>
            </DropdownMenuItem>
            {isOwner && (
              <>
                <DropdownMenuItem onClick={handleVisibilityChange}>
                  {isPublic ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Make Private
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Make Public
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`/persona/${persona.persona_id}/chat`}>
                    Chat with Persona
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`/persona-detail/${persona.persona_id}`}>
                    Clone Persona
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {persona.prompt?.substring(0, 80) || "No description"}...
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        {persona.is_public ? (
          <Badge variant="secondary">Public</Badge>
        ) : (
          <Badge variant="outline">Private</Badge>
        )}
        <div className="flex gap-2">
          <AddToCollectionButton personaId={persona.persona_id} />
          {isOwner && (
            <DeletePersonaDialog
              personaId={persona.persona_id}
              personaName={persona.name}
              userId={persona.user_id}
              onDelete={() => {
                if (onDelete) {
                  onDelete(persona.persona_id);
                }
              }}
            />
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default PersonaCard;
