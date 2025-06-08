
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, MoreHorizontal, UserCheck, Clock, Tag, MapPin, DollarSign, Users } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  showDeleteButton = false
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

  // Get display metadata
  const ageRange = persona.metadata?.demographics?.age_range;
  const region = persona.metadata?.demographics?.region;
  const income = persona.metadata?.demographics?.income_level;
  const sourceType = persona.metadata?.source_type || "simulated";
  const tags = persona.metadata?.tags || [];

  // Generate initials for avatar fallback
  const initials = persona.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="bg-card text-card-foreground shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-start gap-3 flex-1">
          {/* Avatar */}
          <Avatar className="h-12 w-12 border-2 border-border">
            <AvatarImage 
              src={persona.profile_image_url} 
              alt={persona.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-accent text-accent-foreground font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          {/* Name and basic info */}
          <div className="flex flex-col space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div 
                className="font-semibold text-base hover:text-primary cursor-pointer transition-colors truncate group-hover:text-primary" 
                onClick={handleViewDetails}
                title={persona.name}
              >
                {persona.name}
              </div>
              {isOwner && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                  <UserCheck className="h-3 w-3 mr-1" />
                  Owner
                </Badge>
              )}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              <span>Created {persona.creation_date}</span>
            </div>
          </div>
        </div>
        
        {/* Actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
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
      
      <CardContent onClick={handleViewDetails} className="cursor-pointer pt-0 pb-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {persona.prompt ? 
            (persona.prompt.length > 120 ? `${persona.prompt.substring(0, 120)}...` : persona.prompt) :
            "No description available"
          }
        </p>
        
        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {ageRange && (
            <div className="flex items-center text-muted-foreground">
              <Users className="h-3 w-3 mr-1.5 text-blue-500" />
              <span>{ageRange}</span>
            </div>
          )}
          {region && (
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-3 w-3 mr-1.5 text-green-500" />
              <span className="capitalize">{region}</span>
            </div>
          )}
          {income && (
            <div className="flex items-center text-muted-foreground">
              <DollarSign className="h-3 w-3 mr-1.5 text-yellow-500" />
              <span className="capitalize">{income}</span>
            </div>
          )}
          <div className="flex items-center text-muted-foreground">
            <Tag className="h-3 w-3 mr-1.5 text-purple-500" />
            <span className="capitalize">{sourceType.replace('-', ' ')}</span>
          </div>
        </div>
        
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs px-2 py-0.5 bg-accent/50 hover:bg-accent transition-colors"
              >
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5 bg-muted">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex items-center justify-between pt-0">
        <div className="flex items-center gap-2">
          <Badge variant={persona.is_public ? "default" : "secondary"}>
            {persona.is_public ? "Public" : "Private"}
          </Badge>
        </div>
        <div className="flex gap-2">
          <AddToCollectionButton personaId={persona.persona_id} />
        </div>
      </CardFooter>
    </Card>
  );
};

export default PersonaCard;
