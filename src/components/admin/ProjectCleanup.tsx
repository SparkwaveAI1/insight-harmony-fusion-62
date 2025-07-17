
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProjectToClean {
  id: string;
  name: string;
  created_at: string;
  conversation_count: number;
}

export const ProjectCleanup: React.FC = () => {
  const [projectsToClean, setProjectsToClean] = useState<ProjectToClean[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const loadEmptyResearchProjects = async () => {
    setIsLoading(true);
    try {
      // Get all projects named "Research Session"
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, created_at')
        .eq('name', 'Research Session')
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      if (!projects || projects.length === 0) {
        setProjectsToClean([]);
        return;
      }

      // Check conversation count for each project
      const projectsWithCounts = await Promise.all(
        projects.map(async (project) => {
          const { count, error: countError } = await supabase
            .from('conversations')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id);

          if (countError) {
            console.error('Error counting conversations:', countError);
            return {
              ...project,
              conversation_count: 0
            };
          }

          return {
            ...project,
            conversation_count: count || 0
          };
        })
      );

      // Filter to only empty projects
      const emptyProjects = projectsWithCounts.filter(p => p.conversation_count === 0);
      setProjectsToClean(emptyProjects);

      toast({
        title: "Projects Loaded",
        description: `Found ${emptyProjects.length} empty "Research Session" projects`,
      });
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEmptyProjects = async () => {
    if (projectsToClean.length === 0) return;

    setIsDeleting(true);
    try {
      const projectIds = projectsToClean.map(p => p.id);
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .in('id', projectIds);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Deleted ${projectsToClean.length} empty "Research Session" projects`,
      });

      setProjectsToClean([]);
    } catch (error) {
      console.error('Error deleting projects:', error);
      toast({
        title: "Error",
        description: "Failed to delete projects",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    loadEmptyResearchProjects();
  }, []);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          Clean Up Empty Projects
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">About to clean up empty "Research Session" projects</p>
            <p>This will only delete projects with no conversations. Projects with data will be preserved.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-4">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading projects...</p>
          </div>
        ) : (
          <>
            <div className="text-center">
              <p className="text-lg font-medium">
                Found {projectsToClean.length} empty "Research Session" projects
              </p>
              {projectsToClean.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  These projects have 0 conversations and can be safely deleted
                </p>
              )}
            </div>

            {projectsToClean.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {projectsToClean.map((project) => (
                  <div key={project.id} className="flex justify-between items-center p-2 bg-muted/50 rounded text-sm">
                    <span>{project.name}</span>
                    <span className="text-muted-foreground">
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={loadEmptyResearchProjects}
                disabled={isLoading}
                className="flex-1"
              >
                Refresh
              </Button>
              {projectsToClean.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={deleteEmptyProjects}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  {isDeleting ? 'Deleting...' : `Delete ${projectsToClean.length} Projects`}
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
