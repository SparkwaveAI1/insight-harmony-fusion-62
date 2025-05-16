
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, MoreHorizontal, UserCheck } from "lucide-react";
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
import AddToCollectionButton from "./AddToCollectionButton";

interface PersonaCardProps {
  persona: Persona;
  onVisibilityChange?: (personaId: string, isPublic: boolean) => void;
  onDelete?: (personaId: string) => void;
  showDeleteButton?: boolean;
}

const PersonaCard: React.FC<PersonaCardProps> = ({ 
  persona, 
  onVisibilityChange, 
  onDelete,
  showDeleteButton = false // Default to not showing delete button
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
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

  const handleViewDetails = () => {
    navigate(`/persona-detail/${persona.persona_id}`);
  };

  return (
    <Card className="bg-card text-card-foreground shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-2">
            <div 
              className="text-sm font-medium hover:text-primary cursor-pointer" 
              onClick={handleViewDetails}
            >
              {persona.name}
            </div>
            {/* Owner indicator badge */}
            {isOwner && (
              <div className="flex items-center text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-full px-2 py-0.5">
                <UserCheck className="h-3 w-3 mr-1" />
                <span>Owner</span>
              </div>
            )}
          </div>
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
            <DropdownMenuItem onClick={handleViewDetails}>
              View Details
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
      <CardContent onClick={handleViewDetails} className="cursor-pointer">
        <p className="text-sm text-muted-foreground">
          {persona.prompt?.substring(0, 80) || "No description"}...
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {persona.is_public ? (
            <Badge variant="secondary">Public</Badge>
          ) : (
            <Badge variant="outline">Private</Badge>
          )}
        </div>
        <div className="flex gap-2">
          <AddToCollectionButton personaId={persona.persona_id} />
        </div>
      </CardFooter>
    </Card>
  );
};

export default PersonaCard;
