
import React, { useState, useEffect } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Plus, FolderOpen, Calendar, MessageSquare, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { getUserProjectsWithCount, createProject } from "@/services/collections";
import { ProjectWithConversationCount } from "@/services/collections/types";
import { toast } from "sonner";
import { SupabaseDebug } from "@/components/debug/SupabaseDebug";

const Projects = () => {
  const [projects, setProjects] = useState<ProjectWithConversationCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      console.log("Loading projects...");
      setIsLoading(true);
      try {
        const data = await getUserProjectsWithCount();
        console.log("Projects loaded:", data);
        setProjects(data);
      } catch (error) {
        console.error("Error loading projects:", error);
        toast.error("Failed to load projects");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProjects();
  }, []);

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      toast.error("Project name is required");
      return;
    }
    
    try {
      setIsCreating(true);
      const newProject = await createProject(projectName, projectDescription || null);
      
      if (newProject) {
        const projectWithCount = { ...newProject, conversation_count: 0 };
        setProjects(prev => [projectWithCount, ...prev]);
        setCreateDialogOpen(false);
        setProjectName("");
        setProjectDescription("");
        toast.success("Project created successfully");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <div className="relative flex min-h-svh flex-col">
            <Header />
            <main className="flex-1 pt-24">
              <div className="container py-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold font-plasmik">Projects</h1>
                    <p className="text-muted-foreground mt-2">
                      Organize your research conversations and studies
                    </p>
                  </div>
                  
                  <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Project
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Create New Project</DialogTitle>
                        <DialogDescription>
                          Create a new project to organize your research conversations.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Project Name</Label>
                          <Input
                            id="name"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            placeholder="Enter project name"
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="description">
                            Description <span className="text-muted-foreground">(optional)</span>
                          </Label>
                          <Textarea
                            id="description"
                            value={projectDescription}
                            onChange={(e) => setProjectDescription(e.target.value)}
                            placeholder="Enter project description"
                            rows={4}
                          />
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => setCreateDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleCreateProject}
                          disabled={isCreating || !projectName.trim()}
                        >
                          {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Create Project
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Debug component */}
                <SupabaseDebug />
                
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                      <Card 
                        key={project.id} 
                        className="hover:shadow-md transition-shadow cursor-pointer group"
                      >
                        <Link to={`/projects/${project.id}`} className="block">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <FolderOpen className="h-8 w-8 text-primary group-hover:text-primary/80 transition-colors" />
                              <div className="flex flex-col items-end text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(project.updated_at), "MMM d")}
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <CardTitle className="group-hover:text-primary transition-colors">
                                {project.name}
                              </CardTitle>
                              {project.description && (
                                <CardDescription className="mt-1 line-clamp-2">
                                  {project.description}
                                </CardDescription>
                              )}
                            </div>
                          </CardHeader>
                          
                          <CardContent className="pt-0">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MessageSquare className="h-4 w-4" />
                              <span>
                                {project.conversation_count} conversation{project.conversation_count !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </CardContent>
                        </Link>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                      Create your first project to start organizing your research conversations and studies.
                    </p>
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Project
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Create New Project</DialogTitle>
                          <DialogDescription>
                            Create a new project to organize your research conversations.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="name">Project Name</Label>
                            <Input
                              id="name"
                              value={projectName}
                              onChange={(e) => setProjectName(e.target.value)}
                              placeholder="Enter project name"
                            />
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor="description">
                              Description <span className="text-muted-foreground">(optional)</span>
                            </Label>
                            <Textarea
                              id="description"
                              value={projectDescription}
                              onChange={(e) => setProjectDescription(e.target.value)}
                              placeholder="Enter project description"
                              rows={4}
                            />
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => setCreateDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleCreateProject}
                            disabled={isCreating || !projectName.trim()}
                          >
                            {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Create Project
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
            </main>
            <Footer />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Projects;
