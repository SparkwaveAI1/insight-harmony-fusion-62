
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import DeletePersonaDialog from "./DeletePersonaDialog";
import AddToCollectionButton from "./AddToCollectionButton";
import RemoveFromCollectionButton from "./RemoveFromCollectionButton";

interface PersonaCardProps {
  persona: any;
  onDelete?: () => void;
  inCollection?: boolean;
  collectionId?: string;
  onRemoveFromCollection?: () => void;
}

const PersonaCard: React.FC<PersonaCardProps> = ({
  persona,
  onDelete,
  inCollection = false,
  collectionId,
  onRemoveFromCollection,
}) => {
  const initials = persona.name
    ? persona.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : "??";

  return (
    <Card className="relative h-full flex flex-col transition-shadow hover:shadow-md">
      {inCollection && collectionId && (
        <RemoveFromCollectionButton
          personaId={persona.persona_id}
          collectionId={collectionId}
          onRemoveComplete={onRemoveFromCollection}
        />
      )}
      
      <Link
        to={`/persona/${persona.persona_id}`}
        className="flex-1 flex flex-col"
      >
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg">{persona.name}</h3>
            {persona.metadata?.age && persona.metadata?.occupation && (
              <p className="text-sm text-muted-foreground">
                {persona.metadata.age} • {persona.metadata.occupation}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="line-clamp-3 text-sm text-muted-foreground">
            {persona.metadata?.background || "No background available"}
          </div>
        </CardContent>
      </Link>

      <div className="p-4 pt-0 flex justify-between items-center mt-auto">
        {!inCollection && <AddToCollectionButton personaId={persona.persona_id} />}
        
        {onDelete && (
          <DeletePersonaDialog
            personaId={persona.persona_id}
            personaName={persona.name}
            onDelete={onDelete}
          />
        )}
      </div>
    </Card>
  );
};

export default PersonaCard;
