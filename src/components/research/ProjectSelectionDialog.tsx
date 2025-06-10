
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getUserProjects, createProject } from '@/services/collections/projectOperations';
import { Project } from '@/services/collections/types';
import { Loader2, Plus, Save, FolderPlus, Users, Folder } from 'lucide-react';
import { toast } from 'sonner';

interface ProjectSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectSelected: (projectId: string | null) => void;
}

const ProjectSelectionDialog: React.FC<ProjectSelectionDialogProps> = ({
  open,
  onOpenChange,
  onProjectSelected
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");

  useEffect(() => {
    if (open) {
      loadProjects();
    }
  }, [open]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      console.log('Loading projects for dialog...');
      const userProjects = await getUserProjects();
      console.log('Projects loaded for dialog:', userProjects);
      setProjects(userProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast.error("Project name is required");
      return;
    }

    setIsLoading(true);
    try {
      const project = await createProject(newProjectName, newProjectDescription || null);
      
      if (project) {
        await loadProjects();
        setSelectedProjectId(project.id);
        setIsCreatingProject(false);
        setNewProjectName("");
        setNewProjectDescription("");
        toast.success("Project created successfully");
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueWithProject = () => {
    if (!selectedProjectId) {
      toast.error("Please select a project");
      return;
    }
    onProjectSelected(selectedProjectId);
    onOpenChange(false);
  };

  const handleContinueWithoutProject = () => {
    onProjectSelected(null);
    onOpenChange(false);
  };

  const getProjectStats = (project: any) => {
    const collections = project.project_collections || [];
    const totalPersonas = collections.reduce((total: number, pc: any) => {
      return total + (pc.collections?.collection_personas?.length || 0);
    }, 0);
    
    return {
      collections: collections.length,
      personas: totalPersonas
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Research Project Setup</DialogTitle>
          <DialogDescription>
            Would you like to associate this research session with a project? This helps organize your conversations and findings.
          </DialogDescription>
        </DialogHeader>
        
        {isCreatingProject ? (
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="new-project-name">Project Name</Label>
              <Input
                id="new-project-name"
                placeholder="Enter project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-project-description">Description (Optional)</Label>
              <Textarea
                id="new-project-description"
                placeholder="Enter project description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={() => setIsCreatingProject(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleCreateProject} 
                className="flex-1"
                disabled={isLoading || !newProjectName.trim()}
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Create Project
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Loading projects...</span>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="project">Select Project (Optional)</Label>
                  <div className="flex gap-2">
                    <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => {
                          const stats = getProjectStats(project);
                          return (
                            <SelectItem key={project.id} value={project.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{project.name}</span>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Folder className="h-3 w-3" />
                                    {stats.collections} collections
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {stats.personas} personas
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setIsCreatingProject(true)}
                      title="Create new project"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {projects.length === 0 && !isLoading && (
                    <p className="text-xs text-muted-foreground">
                      No projects found. Create a new project to organize your research.
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleContinueWithProject}
                    disabled={!selectedProjectId}
                    className="w-full"
                  >
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Continue with Selected Project
                  </Button>
                  
                  <Button
                    onClick={handleContinueWithoutProject}
                    variant="outline"
                    className="w-full"
                  >
                    Continue without Project
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProjectSelectionDialog;
