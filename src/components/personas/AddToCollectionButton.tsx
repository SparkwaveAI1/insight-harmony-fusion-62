
import React, { useState } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddToCollectionDialog from "./AddToCollectionDialog";

interface AddToCollectionButtonProps {
  personaId: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "destructive";
}

const AddToCollectionButton: React.FC<AddToCollectionButtonProps> = ({
  personaId,
  size = "icon",
  variant = "ghost",
}) => {
  const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false);

  const handleAddToCollection = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCollectionDialogOpen(true);
  };

  return (
    <>
      <Button
        onClick={handleAddToCollection}
        size={size}
        variant={variant}
        title="Add to collection"
        className="hover:bg-accent/80"
      >
        <Bookmark className="h-4 w-4" />
        {size !== "icon" && <span className="ml-2">Add to Collection</span>}
      </Button>

      <AddToCollectionDialog
        open={isCollectionDialogOpen}
        onOpenChange={setIsCollectionDialogOpen}
        personaId={personaId}
      />
    </>
  );
};

export default AddToCollectionButton;
