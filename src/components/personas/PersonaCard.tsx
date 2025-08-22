
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, MoreHorizontal, UserCheck, Clock, MapPin, Briefcase, User } from "lucide-react";
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

  // Generate initials for avatar fallback
  const initials = persona.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Get description with proper fallback
  const getDescription = () => {
    // First try V4 background description
    if (persona.conversation_summary?.demographics?.background_description && persona.conversation_summary.demographics.background_description.trim()) {
      return persona.conversation_summary.demographics.background_description;
    }
    
    // Then try the direct description field (legacy)
    if (persona.description && persona.description.trim()) {
      return persona.description;
    }
    
    // Then try metadata description
    if (persona.metadata?.description && persona.metadata.description.trim()) {
      return persona.metadata.description;
    }
    
    // Then try prompt as fallback
    if (persona.prompt && persona.prompt.trim()) {
      return persona.prompt;
    }
    
    // Default fallback
    return "No description available";
  };

  const description = getDescription();
  
  // Helper function to get V4 data with legacy fallback
  const getV4DataWithFallback = (v4Path: any, legacyPath: any, defaultValue: string = 'Not specified') => {
    return v4Path && v4Path !== 0 && v4Path !== '' ? v4Path : (legacyPath || defaultValue);
  };
  
  const age = getV4DataWithFallback(
    persona.conversation_summary?.demographics?.age, 
    persona.metadata?.age, 
    'Not specified'
  );
  const location = (() => {
    const locationStr = persona.conversation_summary?.demographics?.location;
    if (locationStr && typeof locationStr === 'string' && locationStr.trim()) {
      return locationStr;
    }
    return getV4DataWithFallback(
      persona.conversation_summary?.demographics?.location,
      persona.metadata?.location || persona.metadata?.region,
      'Not specified'
    );
  })();
  const occupation = getV4DataWithFallback(
    persona.conversation_summary?.demographics?.occupation,
    persona.metadata?.occupation,
    'Not specified'
  );

  return (
    <Card className="bg-card text-card-foreground shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="flex items-start gap-4 flex-1">
          {/* Profile Photo */}
          <Avatar className="h-16 w-16 border-2 border-border rounded-lg">
            <AvatarImage 
              src={persona.profile_image_url} 
              alt={persona.name}
              className="object-cover rounded-lg"
            />
            <AvatarFallback className="bg-accent text-accent-foreground font-semibold rounded-lg text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          {/* Name and Owner Badge */}
          <div className="flex flex-col space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div 
                className="font-semibold text-lg hover:text-primary cursor-pointer transition-colors truncate group-hover:text-primary" 
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
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent onClick={handleViewDetails} className="cursor-pointer pt-0 pb-4">
        {/* Key Details Grid */}
        <div className="grid grid-cols-1 gap-3 mb-4">
          <div className="flex items-center text-sm">
            <User className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
            <span className="text-muted-foreground mr-2">Age:</span>
            <span className="font-medium">{age}</span>
          </div>
          <div className="flex items-center text-sm">
            <MapPin className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
            <span className="text-muted-foreground mr-2">Location:</span>
            <span className="font-medium truncate">{location}</span>
          </div>
          <div className="flex items-center text-sm">
            <Briefcase className="h-4 w-4 mr-2 text-purple-500 flex-shrink-0" />
            <span className="text-muted-foreground mr-2">Occupation:</span>
            <span className="font-medium truncate">{occupation}</span>
          </div>
        </div>
        
        {/* Description */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
          <p className="text-sm text-foreground line-clamp-3 leading-relaxed">
            {description.length > 150 ? `${description.substring(0, 150)}...` : description}
          </p>
        </div>
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
