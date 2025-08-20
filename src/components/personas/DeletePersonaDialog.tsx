
import React, { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deletePersona } from "@/services/persona";
import { useAuth } from "@/context/AuthContext";

interface DeletePersonaDialogProps {
  personaId: string;
  personaName: string;
  onDelete: () => void;
  userId?: string;
}

const DeletePersonaDialog: React.FC<DeletePersonaDialogProps> = ({ 
  personaId, 
  personaName, 
  onDelete,
  userId 
}) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  // Check if current user is the owner of this persona
  const isOwner = user?.id === userId;

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      if (!isOwner) {
        toast.error("You don't have permission to delete this persona");
        setOpen(false);
        setIsLoading(false);
        return;
      }
      
      const success = await deletePersona(personaId);
      if (success) {
        toast.success("Persona deleted successfully");
        onDelete();
      } else {
        toast.error("Failed to delete persona");
      }
    } catch (error) {
      console.error("Error deleting persona:", error);
      toast.error("Failed to delete persona");
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  };

  // Only render the delete button if the user is the owner
  if (!isOwner) {
    return null;
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the persona &quot;{personaName}&quot; from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeletePersonaDialog;
