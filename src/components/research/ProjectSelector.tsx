import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getUserProjects, createProject } from '@/services/collections/projectOperations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FolderOpen, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface ProjectSelectorProps {
  onProjectSelected: (projectId: string) => void;
  showCreateOption?: boolean;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({ 
  onProjectSelected, 
  showCreateOption = true 
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    research_objectives: '',
    methodology: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Optimized query with React Query caching
  const { 
    data: projects = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['user-projects'],
    queryFn: getUserProjects,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Handle query error
  useEffect(() => {
    if (error) {
      console.error('Error loading projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive"
      });
    }
  }, [error, toast]);


  const handleCreateProject = async () => {
    if (!newProject.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Project name is required",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const project = await createProject(
        newProject.name,
        newProject.description || null,
        null, // information
        newProject.research_objectives || null,
        newProject.methodology || null
      );

      if (!project) throw new Error('Failed to create project');

      toast({
        title: "Success",
        description: `Project "${newProject.name}" created successfully`,
      });

      setShowCreateDialog(false);
      setNewProject({ name: '', description: '', research_objectives: '', methodology: '' });
      
      // Refetch projects to update the list
      await refetch();
      
      // Auto-select the new project
      handleProjectSelect(project.id);
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    
    // Update URL with project parameter
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('project', projectId);
    navigate(`/research?${newSearchParams.toString()}`, { replace: true });
    
    onProjectSelected(projectId);
  };

  const handleContinueWithoutProject = () => {
    // Clear project parameter if it exists
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('project');
    const newUrl = newSearchParams.toString() ? 
      `/research?${newSearchParams.toString()}` : 
      '/research';
    navigate(newUrl, { replace: true });
    
    onProjectSelected('');
  };

  // Show skeleton loading state for better UX
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Select Project</h2>
          <p className="text-muted-foreground">
            Connect your survey to a project to save results, or continue without saving.
          </p>
        </div>
        
        {/* Skeleton for existing projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Existing Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-10 bg-muted animate-pulse rounded-md" />
          </CardContent>
        </Card>
        
        {/* Skeleton for create option */}
        {showCreateOption && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Study Session
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-10 bg-muted animate-pulse rounded-md" />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Select Project</h2>
        <p className="text-muted-foreground">
          Connect your survey to a project to save results, or continue without saving.
        </p>
      </div>

      {projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Existing Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedProjectId} onValueChange={handleProjectSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a project..." />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {showCreateOption && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Study Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  Create New Study Session
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Study Session</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Project Name *</Label>
                    <Input
                      id="name"
                      value={newProject.name}
                      onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="My Research Project"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newProject.description}
                      onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of your research project..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateProject} disabled={isCreating}>
                      {isCreating ? 'Creating...' : 'Create Project'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm text-amber-800">
                <strong>Continue without project:</strong> You can run surveys without connecting to a project, 
                but results cannot be saved. You'll only be able to export them.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleContinueWithoutProject}
                className="border-amber-300 text-amber-800 hover:bg-amber-100"
              >
                Continue Without Saving
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectSelector;