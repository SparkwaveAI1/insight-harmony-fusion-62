
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { ArrowLeft, Calendar, Edit2, FileText, MessageSquare, MoreHorizontal, Plus, Trash, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { getProjectById, getProjectConversations, updateProject } from "@/services/collections";
import { toast } from "sonner";
import { Conversation } from "@/services/collections/types";

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState<string | null>("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      console.log("URL params:", { projectId });
      console.log("Current window location:", window.location.href);
      console.log("Loading project with ID:", projectId);
      setIsLoading(true);
      setHasError(false);
      
      try {
        if (projectId) {
          console.log("Fetching project data...");
          const projectData = await getProjectById(projectId);
          console.log("Project data received:", projectData);
          
          if (projectData) {
            setProject(projectData);
            setProjectName(projectData.name);
            setProjectDescription(projectData.description || "");
            console.log("Project state updated successfully");
            
            console.log("Fetching conversations...");
            const conversationsData = await getProjectConversations(projectId);
            console.log("Conversations data received:", conversationsData);
            setConversations(conversationsData);
          } else {
            console.error("No project data returned");
            setHasError(true);
            toast.error("Project not found");
          }
        } else {
          console.error("No project ID in URL params");
          setHasError(true);
          toast.error("Invalid project URL");
        }
      } catch (error) {
        console.error("Error loading project:", error);
        setHasError(true);
        toast.error("Failed to load project");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProject();
  }, [projectId]);

  const handleUpdateProject = async () => {
    try {
      setIsEditing(true);
      
      if (!projectId || !projectName.trim()) {
        toast.error("Project name is required");
        return;
      }
      
      const updatedProject = await updateProject(projectId, {
        name: projectName,
        description: projectDescription || null,
      });
      
      if (updatedProject) {
        setProject(updatedProject);
        setEditDialogOpen(false);
        toast.success("Project updated successfully");
      }
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project");
    } finally {
      setIsEditing(false);
    }
  };

  console.log("Render state - isLoading:", isLoading, "project:", project, "conversations:", conversations, "hasError:", hasError);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <div className="relative flex min-h-svh flex-col">
            <Header />
            <main className="flex-1 pt-24">
              <div className="container py-6">
                {isLoading ? (
                  <div className="flex items-center justify-center h-[60vh]">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                      <p>Loading project...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-2xl md:text-3xl font-bold font-plasmik">
                          {project?.name || `Project ${projectId?.slice(0, 8) || 'Unknown'}`}
                        </h1>
                        {hasError && (
                          <div className="flex items-center gap-2 text-amber-600">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm">Failed to load project data</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {project && (
                          <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit Project
                          </Button>
                        )}
                        <Button asChild>
                          <Link to="/projects">Back to Projects</Link>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                              <CardTitle>Conversations</CardTitle>
                              <CardDescription>
                                Chat conversations saved in this project
                              </CardDescription>
                            </div>
                            
                            <Button asChild>
                              <Link to={`/research/setup/structured?project=${projectId}`}>
                                <Plus className="h-4 w-4 mr-2" />
                                New Study Session
                              </Link>
                            </Button>
                          </CardHeader>
                          <CardContent>
                            {conversations.length > 0 ? (
                              <div className="space-y-3">
                                {conversations.map((conversation) => (
                                  <Card key={conversation.id} className="bg-muted/30">
                                    <CardContent className="p-4">
                                      <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                          <h3 className="font-medium">{conversation.title}</h3>
                                          <p className="text-sm text-muted-foreground">
                                            <Calendar className="h-3 w-3 inline-block mr-1" />
                                            {format(new Date(conversation.created_at), "MMM d, yyyy")}
                                          </p>
                                        </div>
                                        
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          asChild
                                          className="text-primary"
                                        >
                                          <Link to={`/conversations/${conversation.id}`}>
                                            <MessageSquare className="h-4 w-4 mr-1" />
                                            View
                                          </Link>
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <div className="p-8 flex flex-col items-center justify-center text-center">
                                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                  <FileText className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h3 className="font-medium mb-1">No conversations yet</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                  Start a new structured study session to begin research with personas
                                </p>
                                <Button asChild>
                                  <Link to={`/research/setup/structured?project=${projectId}`}>Start New Study Session</Link>
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div>
                        <Card>
                          <CardHeader>
                            <CardTitle>Project Details</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {project ? (
                              <>
                                <div>
                                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                    Description
                                  </h3>
                                  {project.description ? (
                                    <p>{project.description}</p>
                                  ) : (
                                    <p className="italic text-muted-foreground">No description provided</p>
                                  )}
                                </div>
                                
                                <Separator />
                                
                                <div>
                                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                    Created
                                  </h3>
                                  <p>
                                    {format(new Date(project.created_at), "MMMM d, yyyy")}
                                  </p>
                                </div>
                                
                                <Separator />
                                
                                <div>
                                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                    Last Updated
                                  </h3>
                                  <p>
                                    {format(new Date(project.updated_at), "MMMM d, yyyy")}
                                  </p>
                                </div>
                                
                                <Separator />
                                
                                <div>
                                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                    Conversations
                                  </h3>
                                  <p>
                                    {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                                  </p>
                                </div>
                              </>
                            ) : (
                              <div className="text-center py-4">
                                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">
                                  Project details unavailable
                                </p>
                                {hasError && (
                                  <p className="text-xs text-red-600 mt-2">
                                    There was an error loading the project data. Please try refreshing the page.
                                  </p>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </main>
            <Footer />
            
            {/* Edit Project Dialog */}
            {project && (
              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Project</DialogTitle>
                    <DialogDescription>
                      Update the details of your project.
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
                        value={projectDescription || ""}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        placeholder="Enter project description"
                        rows={4}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setEditDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleUpdateProject}
                      disabled={isEditing || !projectName.trim()}
                    >
                      {isEditing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ProjectDetail;
