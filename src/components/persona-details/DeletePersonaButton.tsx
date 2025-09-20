
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";

interface DeletePersonaButtonProps {
  onDelete: () => Promise<void>;
  isOwner: boolean;
  variant?: 'default' | 'small';  // Add variant prop
}

export default function DeletePersonaButton({ onDelete, isOwner, variant = 'default' }: DeletePersonaButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDeletePersona = async () => {
    setIsDeleting(true);
    await onDelete();
    setIsDeleting(false);
  };
  
  // Only show delete button to the owner
  if (!isOwner) return null;
  
  const isSmall = variant === 'small';
  
  return (
    <div className={isSmall ? "" : "mt-8 mb-4"}>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="destructive"
            size={isSmall ? "sm" : "default"}
            className={isSmall ? "text-xs px-3 py-1" : "w-full"}
          >
            <Trash2 className={`${isSmall ? "h-3 w-3" : "h-4 w-4"} mr-2`} />
            Delete Persona
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this persona and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePersona} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
