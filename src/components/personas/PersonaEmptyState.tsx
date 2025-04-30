
import React from "react";
import { FolderOpen } from "lucide-react";

interface PersonaEmptyStateProps {
  title?: string;
  description?: string;
}

const PersonaEmptyState: React.FC<PersonaEmptyStateProps> = ({
  title = "No personas found",
  description = "There are no personas to display at this time."
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-lg">
      <div className="rounded-full bg-muted/20 p-6">
        <FolderOpen className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="font-medium text-lg mt-6">{title}</h3>
      <p className="text-muted-foreground mt-2 text-center max-w-md">
        {description}
      </p>
    </div>
  );
};

export default PersonaEmptyState;
