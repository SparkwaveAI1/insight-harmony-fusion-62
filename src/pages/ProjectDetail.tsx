
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import Section from "@/components/ui-custom/Section";
import Card from "@/components/ui-custom/Card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { getProjectById, getProjectConversations, updateProject, deleteConversation } from "@/services/collections";
import { ArrowLeft, Edit, Trash2, MessageSquare, Calendar } from "lucide-react";
import { format } from "date-fns";

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (projectId) {
      loadProjectData(projectId);
    }
  }, [projectId]);

  const loadProjectData = async (id: string) => {
    setIsLoading(true);
    const projectData = await getProjectById(id);
    if (projectData) {
      setProject(projectData);
      setProjectName(projectData.name);
      setProjectDescription(projectData.description || '');
      
      // Load conversations for this project
      const conversationsData = await getProjectConversations(id);
      setConversations(conversationsData);
    }
    setIsLoading(false);
  };

  const handleUpdateProject = async () => {
    if (!projectId || !projectName.trim()) return;

    const updated = await updateProject(projectId, {
      name: projectName,
      description: projectDescription || null
    });

    if (updated) {
      setProject(updated);
      setEditDialogOpen(false);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    if (confirm("Are you sure you want to delete this conversation?")) {
      const deleted = await deleteConversation(id);
      if (deleted && projectId) {
        // Reload conversations
        const conversationsData = await getProjectConversations(projectId);
        setConversations(conversationsData);
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Section className="pt-24">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="flex justify-center my-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : !project ? (
              <Card className="p-12 text-center">
                <h3 className="text-xl font-semibold mb-4">Project Not Found</h3>
                <p className="text-muted-foreground mb-6">
                  The project you're looking for doesn't exist or couldn't be loaded.
                </p>
                <Button as={Link} to="/projects">View All Projects</Button>
              </Card>
            ) : (
              <>
                {/* Header with back button */}
                <div className="mb-6">
                  <Button variant="ghost" className="pl-0" as={Link} to="/projects">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Projects
                  </Button>
                </div>

                {/* Project header */}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h1 className="text-3xl font-bold mb-2 font-plasmik">{project.name}</h1>
                    {project.description && (
                      <p className="text-muted-foreground max-w-2xl">{project.description}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">
                      Created {formatDate(project.created_at)}
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Project
                  </Button>
                </div>

                <Separator className="my-6" />

                {/* Conversations listing */}
                <h2 className="text-xl font-semibold mb-6">Conversations</h2>
                
                {conversations.length === 0 ? (
                  <Card className="p-8 text-center">
                    <div className="flex justify-center">
                      <div className="bg-muted/50 h-12 w-12 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Conversations Yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Save conversations from chats to store them in this project.
                    </p>
                    <Button as={Link} to="/persona-viewer">
                      Chat with a Persona
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {conversations.map((conversation) => (
                      <Card key={conversation.id} className="p-4 hover:bg-accent/5 transition-colors group">
                        <div className="flex items-start justify-between">
                          <Link to={`/conversations/${conversation.id}`} className="flex-1">
                            <div className="flex items-center mb-1">
                              <MessageSquare className="h-4 w-4 text-primary mr-2" />
                              <h3 className="font-medium">{conversation.title}</h3>
                            </div>
                            
                            {conversation.tags && conversation.tags.length > 0 && (
                              <div className="flex gap-2 my-2 flex-wrap">
                                {conversation.tags.map((tag: string, index: number) => (
                                  <span 
                                    key={index} 
                                    className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            <p className="text-xs text-muted-foreground mt-1 flex items-center">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              {formatDate(conversation.created_at)}
                            </p>
                          </Link>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100"
                            onClick={() => handleDeleteConversation(conversation.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </Section>
      </main>

      {/* Edit Project Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update your project details.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-project-name">Project Name</Label>
              <Input
                id="edit-project-name"
                placeholder="Enter project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-project-description">Description (Optional)</Label>
              <Textarea
                id="edit-project-description"
                placeholder="Enter project description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleUpdateProject}
              disabled={!projectName.trim()}
            >
              Update Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default ProjectDetail;
