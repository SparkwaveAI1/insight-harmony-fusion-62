
import React from "react";
import { Link } from "react-router-dom";
import Card from "@/components/ui-custom/Card";
import { Button } from "@/components/ui/button";
import { Folder, Trash2, Calendar, MessageSquare } from "lucide-react";
import { ProjectWithConversationCount } from "@/services/collections";
import { format } from "date-fns";

type ProjectsListProps = {
  projects: ProjectWithConversationCount[];
  isLoading: boolean;
  onDeleteProject: (id: string) => void;
  formatDate: (dateString: string) => string;
};

const ProjectsList = ({ 
  projects, 
  isLoading, 
  onDeleteProject,
  formatDate 
}: ProjectsListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center my-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (projects.length === 0) {
    return <EmptyProjectsState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Link to={`/projects/${project.id}`} key={project.id} className="block group">
          <Card className="p-6 h-full transition-transform group-hover:scale-[1.01]">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mr-3">
                  <Folder className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{project.name}</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDeleteProject(project.id);
                }}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground/70" />
              </Button>
            </div>
            
            {project.description && (
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {project.description}
              </p>
            )}

            <div className="flex items-center justify-between mt-auto pt-2 text-xs text-muted-foreground">
              <div className="flex items-center">
                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                <span>{project.conversation_count} conversation{project.conversation_count !== 1 && 's'}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                <span>Updated {formatDate(project.updated_at)}</span>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};

const EmptyProjectsState = () => (
  <Card className="p-12 text-center">
    <div className="flex justify-center">
      <div className="bg-muted/50 h-16 w-16 rounded-full flex items-center justify-center mb-4">
        <Folder className="h-8 w-8 text-muted-foreground" />
      </div>
    </div>
    <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
    <p className="text-muted-foreground mb-6">
      Projects help you group conversations around themes or research topics.
    </p>
    <Button onClick={() => {}}>
      <Folder className="h-4 w-4 mr-2" />
      Create Your First Project
    </Button>
  </Card>
);

export default ProjectsList;
