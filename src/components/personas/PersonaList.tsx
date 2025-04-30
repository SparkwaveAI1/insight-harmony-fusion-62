
import React, { useState, useEffect } from "react";
import { getPersonasByCollection } from "@/services/persona/personaService";
import PersonaCard from "./PersonaCard";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import PersonaEmptyState from "./PersonaEmptyState";
import PersonaLoadingState from "./PersonaLoadingState";

interface PersonaListProps {
  onPersonasLoad?: (personas: any[]) => void;
  collectionId?: string;
  onDeleteCollection?: () => void;
  filterByCurrentUser?: boolean; // Added missing prop
  publicOnly?: boolean; // Added missing prop
}

const PersonaList: React.FC<PersonaListProps> = ({
  onPersonasLoad,
  collectionId,
  onDeleteCollection,
  filterByCurrentUser = false, // Default value
  publicOnly = false, // Default value
}) => {
  const [personas, setPersonas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPersonas = async () => {
    setLoading(true);
    try {
      let data;
      if (collectionId) {
        data = await getPersonasByCollection(collectionId);
      } else {
        // You might want to implement a different fetch here for non-collection scenarios
        data = [];
      }
      setPersonas(data);
      if (onPersonasLoad) {
        onPersonasLoad(data);
      }
    } catch (error) {
      console.error("Failed to fetch personas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonas();
  }, [collectionId, filterByCurrentUser, publicOnly]);

  const handleRemoveFromCollection = () => {
    fetchPersonas();
  };

  if (loading) {
    return <PersonaLoadingState />;
  }

  if (personas.length === 0) {
    return (
      <div>
        <PersonaEmptyState 
          title="No personas in this collection" 
          description="This collection doesn't have any personas yet. Add personas to this collection to see them here."
        />
        {collectionId && onDeleteCollection && (
          <div className="mt-6 flex justify-center">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="mt-4">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Collection
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Collection</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this collection? This action cannot be undone.
                    The personas in this collection will not be deleted, just the collection itself.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDeleteCollection} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete Collection
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {personas.map((persona) => (
          <PersonaCard 
            key={persona.persona_id} 
            persona={persona} 
            inCollection={!!collectionId}
            collectionId={collectionId}
            onRemoveFromCollection={handleRemoveFromCollection}
          />
        ))}
      </div>
      
      {collectionId && onDeleteCollection && (
        <div className="mt-6 flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Collection
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Collection</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this collection? This action cannot be undone.
                  The personas in this collection will not be deleted, just the collection itself.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDeleteCollection} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete Collection
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
};

export default PersonaList;
