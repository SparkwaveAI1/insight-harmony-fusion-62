
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FlaskConical, Folder, Download } from 'lucide-react';
import { getUserProjects, Project } from '@/services/collections';
import { useAuth } from '@/context/AuthContext';

interface ResearchModeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ResearchModeSelector: React.FC<ResearchModeSelectorProps> = ({
  open,
  onOpenChange
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastChoice, setLastChoice] = useState<string>('');

  useEffect(() => {
    // Load user's last choice from localStorage
    const saved = localStorage.getItem('research-mode-last-choice');
    if (saved) {
      setLastChoice(saved);
      setSelectedProject(saved);
    }
  }, []);

  useEffect(() => {
    const loadProjects = async () => {
      if (!user || !open) return;
      
      setIsLoading(true);
      try {
        const userProjects = await getUserProjects();
        setProjects(userProjects);
        
        // If user has a saved choice and it's still valid, pre-select it
        if (lastChoice && lastChoice !== 'no-project') {
          const projectExists = userProjects.some(p => p.id === lastChoice);
          if (projectExists) {
            setSelectedProject(lastChoice);
          }
        }
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [user, open, lastChoice]);

  const handleStartResearch = () => {
    // Save user's choice
    localStorage.setItem('research-mode-last-choice', selectedProject);
    
    if (selectedProject === 'no-project') {
      navigate('/research');
    } else if (selectedProject) {
      navigate(`/research?project=${selectedProject}`);
    }
    
    onOpenChange(false);
  };

  const handleNoProject = () => {
    setSelectedProject('no-project');
    localStorage.setItem('research-mode-last-choice', 'no-project');
    navigate('/research');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            Start Research Session
          </DialogTitle>
          <DialogDescription>
            Choose how you'd like to conduct your research session
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Folder className="h-4 w-4" />
              Connect to Project
            </div>
            
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading projects...</div>
            ) : projects.length > 0 ? (
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project..." />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div>
                        <div className="font-medium">{project.name}</div>
                        {project.description && (
                          <div className="text-xs text-muted-foreground">
                            {project.description.length > 50 
                              ? `${project.description.substring(0, 50)}...` 
                              : project.description}
                          </div>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-sm text-muted-foreground">
                No projects found. Create a project first to access knowledge base features.
              </div>
            )}

            {selectedProject && selectedProject !== 'no-project' && (
              <Button onClick={handleStartResearch} className="w-full">
                Start Research with Project
              </Button>
            )}
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* No Project Option */}
          <div className="space-y-3">
            <Button 
              variant="outline" 
              onClick={handleNoProject}
              className="w-full flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Research Without Project
            </Button>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <div>• No knowledge base access</div>
              <div>• Export transcript only (cannot save)</div>
              <div>• Good for general research conversations</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResearchModeSelector;
