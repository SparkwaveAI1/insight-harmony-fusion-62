
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { removePersonaFromCollection } from "@/services/collections";
import { toast } from "sonner";
import { X } from "lucide-react";

interface RemoveFromCollectionButtonProps {
  personaId: string;
  collectionId: string;
  onRemoveComplete?: () => void;
}

const RemoveFromCollectionButton: React.FC<RemoveFromCollectionButtonProps> = ({
  personaId,
  collectionId,
  onRemoveComplete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRemove = async () => {
    setIsLoading(true);
    try {
      const success = await removePersonaFromCollection(collectionId, personaId);
      if (success) {
        toast.success("Persona removed from collection");
        setIsOpen(false);
        if (onRemoveComplete) {
          onRemoveComplete();
        }
      } else {
        toast.error("Failed to remove persona from collection");
      }
    } catch (error) {
      console.error("Error removing persona from collection:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant="ghost" 
        className="absolute top-2 right-2 h-8 w-8 p-0" 
        onClick={() => setIsOpen(true)}
      >
        <X className="h-4 w-4" />
      </Button>
      
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from collection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this persona from the collection? 
              The persona will not be deleted, just removed from this collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleRemove();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RemoveFromCollectionButton;
