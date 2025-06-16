
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageSquare, Users, FileText } from 'lucide-react';
import { getProjectById } from '@/services/collections';
import { Project, Conversation } from '@/services/collections/types';
import ProjectInformationForm from '@/components/projects/ProjectInformationForm';
import ProjectCollectionsManager from '@/components/projects/ProjectCollectionsManager';
import ProjectKnowledgeBase from '@/components/projects/ProjectKnowledgeBase';
import { Toaster } from "@/components/ui/toaster";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProjectData(id);
    }
  }, [id]);

  const loadProjectData = async (projectId: string) => {
    setIsLoading(true);
    try {
      console.log('Loading project data for ID:', projectId);
      const projectData = await getProjectById(projectId);
      console.log('Project data loaded:', projectData);
      
      setProject(projectData);
      // For now, set conversations to empty array until we implement conversation fetching
      setConversations([]);
    } catch (error) {
      console.error('Error loading project data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectUpdate = (updatedProject: Project) => {
    setProject(updatedProject);
  };

  if (isLoading) {
    return (
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <SidebarInset>
            <div className="relative flex min-h-svh flex-col">
              <Header />
              <main className="flex-1 min-h-0">
                <div className="container h-full py-24">
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-500">Loading project...</p>
                    </div>
                  </div>
                </div>
              </main>
              <Footer />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  if (!project) {
    return (
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <SidebarInset>
            <div className="relative flex min-h-svh flex-col">
              <Header />
              <main className="flex-1 min-h-0">
                <div className="container h-full py-24">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
                    <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or you don't have access to it.</p>
                    <Link to="/projects">
                      <Button>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Projects
                      </Button>
                    </Link>
                  </div>
                </div>
              </main>
              <Footer />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <div className="relative flex min-h-svh flex-col">
            <Header />
            <main className="flex-1 min-h-0">
              <div className="container h-full py-24">
                <div className="flex items-center justify-between mb-6">
                  <SidebarTrigger className="hidden md:flex" />
                </div>

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                  <Link to="/projects">
                    <Button variant="ghost" size="sm">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Projects
                    </Button>
                  </Link>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                    {project.description && (
                      <p className="text-gray-600 mt-1">{project.description}</p>
                    )}
                  </div>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="text-2xl font-bold">{conversations.length}</p>
                          <p className="text-sm text-gray-500">Conversations</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <Users className="h-8 w-8 text-green-500" />
                        <div>
                          <p className="text-2xl font-bold">0</p>
                          <p className="text-sm text-gray-500">Collections</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-purple-500" />
                        <div>
                          <p className="text-2xl font-bold">0</p>
                          <p className="text-sm text-gray-500">Documents</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <ProjectInformationForm 
                      project={project} 
                      onProjectUpdate={handleProjectUpdate}
                    />
                    
                    <ProjectCollectionsManager projectId={project.id} />
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <ProjectKnowledgeBase projectId={project.id} />

                    {/* Recent Conversations */}
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Conversations</CardTitle>
                        <Link to={`/research?project=${project.id}`}>
                          <Button variant="outline" size="sm">
                            Start Research
                          </Button>
                        </Link>
                      </CardHeader>
                      <CardContent>
                        {conversations.length > 0 ? (
                          <div className="space-y-3">
                            {conversations.slice(0, 5).map((conversation) => (
                              <div key={conversation.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                  <h4 className="font-medium">{conversation.title}</h4>
                                  <p className="text-xs text-gray-500">
                                    {new Date(conversation.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  {conversation.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  <Link to={`/conversations/${conversation.id}`}>
                                    <Button variant="ghost" size="sm">
                                      View
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            ))}
                            {conversations.length > 5 && (
                              <div className="text-center pt-2">
                                <Link to={`/projects/${project.id}/conversations`}>
                                  <Button variant="ghost" size="sm">
                                    View All Conversations
                                  </Button>
                                </Link>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No conversations yet. Start your first research session!</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </main>
            <Footer />
            <Toaster />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ProjectDetail;
