
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deletePersona } from "@/services/persona/personaService";

interface DeletePersonaDialogProps {
  personaId: string;
  personaName: string;
  onDelete: () => void;
}

export default function DeletePersonaDialog({
  personaId,
  personaName,
  onDelete,
}: DeletePersonaDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deletePersona(personaId);
      toast.success(`Persona "${personaName}" has been deleted`);
      onDelete();
    } catch (error) {
      console.error("Error deleting persona:", error);
      toast.error("Failed to delete persona");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className="p-2 bg-background/90 rounded-full hover:bg-red-100 transition-colors"
          title="Delete persona"
          onClick={(e) => e.stopPropagation()} // Prevent event bubbling to parent
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Persona</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{personaName}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
