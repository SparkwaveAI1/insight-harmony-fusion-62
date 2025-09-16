
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import Card from "@/components/ui-custom/Card";
import { Button } from "@/components/ui/button";
import { getUserProjectsWithCount, createProject, deleteProject, ProjectWithConversationCount } from "@/services/collections";
import { Folder, Plus, Trash2, Calendar, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";

const Projects = () => {
  const [projects, setProjects] = useState<ProjectWithConversationCount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectWithConversationCount | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    const data = await getUserProjectsWithCount();
    setProjects(data);
    setIsLoading(false);
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    const project = await createProject(newProjectName, newProjectDescription || null);
    if (project) {
      setCreateDialogOpen(false);
      setNewProjectName('');
      setNewProjectDescription('');
      loadProjects();
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, project: ProjectWithConversationCount) => {
    e.preventDefault();
    e.stopPropagation();
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;

    const deleted = await deleteProject(projectToDelete.id);
    if (deleted) {
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
      loadProjects();
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return dateString;
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
                  <SidebarTrigger className="hidden md:flex" />
                  <div className="flex-1 ml-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h1 className="text-3xl font-bold mb-2 font-plasmik">Projects</h1>
                        <p className="text-muted-foreground">
                          Organize your conversations into research projects
                        </p>
                      </div>
                      <Button onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Project
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="px-4">
                  {isLoading ? (
                    <div className="flex justify-center my-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : projects.length === 0 ? (
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
                      <Button onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Project
                      </Button>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {projects.map((project) => (
                        <div key={project.id} className="group relative">
                           <Link to={`/projects/${project.id}`} className="block h-full">
                            <Card className="p-6 h-full transition-transform group-hover:scale-[1.01] flex flex-col">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mr-3">
                                    <Folder className="h-5 w-5 text-primary" />
                                  </div>
                                  <h3 className="font-semibold text-lg">{project.name}</h3>
                                </div>
                              </div>
                              
                              <div className="flex-1">
                                {project.description && (
                                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                    {project.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center justify-between pt-4 text-xs text-muted-foreground border-t border-border/50">
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
                          
                          {/* Delete Button - positioned absolutely */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
                            onClick={(e) => handleDeleteClick(e, project)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </main>
            <Footer />
          </div>
        </SidebarInset>
        
        {/* Create Project Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Create a new project to organize your conversations.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  placeholder="Enter project name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="project-description">Description (Optional)</Label>
                <Textarea
                  id="project-description"
                  placeholder="Enter project description"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
              >
                Create Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Project</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{projectToDelete?.name}"? This will also delete all conversations in this project. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleCancelDelete}>Cancel</Button>
              <Button 
                variant="destructive" 
                onClick={handleConfirmDelete}
              >
                Delete Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
};

export default Projects;
