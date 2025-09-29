
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, MoreHorizontal, UserCheck, Clock, MapPin, Briefcase, User, MessageCircle, X } from "lucide-react";
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
import { V4Persona } from "@/types/persona-v4";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AddToCollectionButton from "./AddToCollectionButton";
import { 
  getPersonaAge, 
  getPersonaLocation, 
  getPersonaOccupation, 
  getPersonaBackgroundDescription 
} from "@/utils/personaDisplayUtils";
import { useQueryClient } from "@tanstack/react-query";

interface PersonaCardProps {
  persona: V4Persona;
  onVisibilityChange?: (personaId: string, isPublic: boolean) => void;
  onDelete?: (personaId: string) => void;
  showDeleteButton?: boolean;
  hideChat?: boolean;
  collectionId?: string;
  onRemoveFromCollection?: (personaId: string, collectionId: string) => void;
}

const PersonaCard: React.FC<PersonaCardProps> = ({ 
  persona, 
  onVisibilityChange, 
  onDelete,
  showDeleteButton = false,
  hideChat = false,
  collectionId,
  onRemoveFromCollection,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isOwner = user?.id === persona.user_id;
  // Normalize is_public value to handle various data types
  const normalizeIsPublic = (value: any): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    if (typeof value === 'number') return value === 1;
    return false;
  };
  
  const currentIsPublic = normalizeIsPublic(persona.is_public);


  const handleVisibilityChange = async () => {
    if (!isOwner) {
      return;
    }

    const newVisibility = !currentIsPublic;
    try {
      const success = await updatePersonaVisibility(persona.persona_id, newVisibility);
      if (success) {
        // Invalidate lists so other views refresh
        queryClient.invalidateQueries({ queryKey: ['my-personas-show-all', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['public-personas-show-all'] });
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

  const handleRemoveFromCollection = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (collectionId && onRemoveFromCollection) {
      onRemoveFromCollection(persona.persona_id, collectionId);
    }
  };

  // Generate initials for avatar fallback
  const initials = persona.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Use utility functions to get V4 persona data
  const age = getPersonaAge(persona) || 'Not specified';
  const location = getPersonaLocation(persona) || 'Not specified';
  const occupation = getPersonaOccupation(persona) || 'Not specified';
  const description = persona.conversation_summary?.character_description || "No description available";

  return (
    <Card className="bg-card text-card-foreground shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group relative overflow-hidden">
      {/* Remove from Collection Button */}
      {collectionId && onRemoveFromCollection && (
        <Button
          onClick={handleRemoveFromCollection}
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 z-10 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
          title="Remove from collection"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
      
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="flex items-start gap-4 flex-1 min-w-0 pr-4">
          {/* Profile Photo */}
          <Avatar className="h-24 w-24 border-2 border-border rounded-lg flex-shrink-0">
            <AvatarImage 
              src={persona.profile_image_url} 
              alt={persona.name}
              className="object-cover rounded-lg"
              loading="lazy"
            />
            <AvatarFallback className="bg-accent text-accent-foreground font-semibold rounded-lg text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          {/* Name and Owner Badge */}
          <div className="flex flex-col space-y-2 flex-1 min-w-0">
            <div className="flex flex-col gap-2">
              <div 
                className="font-semibold text-lg hover:text-primary cursor-pointer transition-colors truncate group-hover:text-primary leading-tight" 
                onClick={handleViewDetails}
                title={persona.name}
              >
                {persona.name}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
               {isOwner && (
                  <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                    <UserCheck className="h-3 w-3 mr-1" />
                    Owner
                  </Badge>
                )}
                {!persona.full_profile?.identity && (
                  <Badge variant="destructive" className="text-xs px-2 py-0.5">
                    Incomplete
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              <span>Created {new Date(persona.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        {/* Upper right actions */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {!hideChat && (
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/persona-detail/${persona.persona_id}/chat`);
              }}
              size="sm"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap"
            >
              <MessageCircle className="mr-1 h-4 w-4" />
              Chat
            </Button>
          )}
          
          {/* Actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border shadow-md z-50">
            <DropdownMenuItem onClick={handleViewDetails}>
              View Details
            </DropdownMenuItem>
            {isOwner && (
              <>
                <DropdownMenuItem onClick={handleVisibilityChange}>
                  {currentIsPublic ? (
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
                {!hideChat && (
                  <DropdownMenuItem asChild>
                    <Link to={`/persona-detail/${persona.persona_id}/chat`}>
                      Chat with Persona
                    </Link>
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
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
            <span className="font-medium truncate min-w-0">{location}</span>
          </div>
          <div className="flex items-center text-sm min-w-0">
            <Briefcase className="h-4 w-4 mr-2 text-purple-500 flex-shrink-0" />
            <span className="text-muted-foreground mr-2">Occupation:</span>
            <span className="font-medium truncate min-w-0">{occupation}</span>
          </div>
        </div>
        
        {/* Description */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
          <p className="text-sm text-foreground line-clamp-3 leading-relaxed">
            {description}
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="flex items-center justify-between pt-0">
        <div className="flex items-center gap-2">
          <Badge variant={currentIsPublic ? "default" : "secondary"}>
            {currentIsPublic ? "Public" : "Private"}
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
