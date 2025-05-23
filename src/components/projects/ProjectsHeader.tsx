
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type ProjectsHeaderProps = {
  onCreateNewProject: () => void;
};

const ProjectsHeader = ({ onCreateNewProject }: ProjectsHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 font-plasmik">Projects</h1>
        <p className="text-muted-foreground">
          Organize your conversations into research projects
        </p>
      </div>
      <Button onClick={onCreateNewProject}>
        <Plus className="h-4 w-4 mr-2" />
        New Project
      </Button>
    </div>
  );
};

export default ProjectsHeader;
