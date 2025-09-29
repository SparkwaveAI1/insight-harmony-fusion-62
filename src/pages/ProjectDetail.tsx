import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageSquare, Users, FileText, AlertCircle, Play } from 'lucide-react';
import { getProjectById, getProjectConversations, getProjectResearchSessions } from '@/services/collections';
import { Project, Conversation } from '@/services/collections/types';
import { ResearchSurveySession } from '@/services/collections/researchOperations';
import ProjectInformationForm from '@/components/projects/ProjectInformationForm';
import ProjectCollectionsManager from '@/components/projects/ProjectCollectionsManager';
import ProjectKnowledgeBase from '@/components/projects/ProjectKnowledgeBase';
import { Toaster } from "@/components/ui/toaster";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ProjectDetail = () => {
  const params = useParams();
  const projectId = params.id || params.projectId;
  
  console.log('URL params:', params);
  console.log('Extracted project ID:', projectId);
  
  const [project, setProject] = useState<Project | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [researchSessions, setResearchSessions] = useState<ResearchSurveySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      loadProjectData(projectId);
    } else {
      console.error('No project ID found in URL params:', params);
      setError("No project ID provided");
      setIsLoading(false);
    }
  }, [projectId, params]);

  const loadProjectData = async (projectId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Loading project data for ID:', projectId);
      
      const [projectData, conversationData, researchData] = await Promise.all([
        getProjectById(projectId),
        getProjectConversations(projectId, 'chat'),
        getProjectResearchSessions(projectId)
      ]);
      
      console.log('Project data loaded:', projectData);
      console.log('Conversations loaded:', conversationData);
      console.log('Research sessions loaded:', researchData);
      
      if (!projectData) {
        setError("Project not found or you don't have access to it");
        setProject(null);
      } else {
        setProject(projectData);
        setConversations(conversationData || []);
        setResearchSessions(researchData || []);
      }
    } catch (error) {
      console.error('Error loading project data:', error);
      setError(`Failed to load project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectUpdate = (updatedProject: Project) => {
    setProject(updatedProject);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  if (error) {
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
                  <div className="text-center">
                    <Alert className="max-w-md mx-auto mb-6">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {error}
                        <br />
                        <small className="text-gray-400">
                          Debug info - URL params: {JSON.stringify(params)}
                        </small>
                      </AlertDescription>
                    </Alert>
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
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
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
                  
                  {/* Prominent Start Research Button */}
                  <Link to={`/research?project=${project.id}`}>
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                      <Play className="h-5 w-5 mr-2" />
                      Start Research
                    </Button>
                  </Link>
                </div>

                {/* Overview Cards */}
                <div className="grid gap-4 md:grid-cols-4 mb-8">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">1-on-1 Conversations</CardTitle>
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{conversations.length}</div>
                      <p className="text-xs text-muted-foreground">
                        Active chat sessions
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Research Reports</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{researchSessions.length}</div>
                      <p className="text-xs text-muted-foreground">
                        Survey studies completed
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Collections</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">0</div>
                      <p className="text-xs text-muted-foreground">
                        Persona collections attached
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Documents</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">0</div>
                      <p className="text-xs text-muted-foreground">
                        Knowledge base documents
                      </p>
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

                    {/* Research Reports */}
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <FileText className="h-5 w-5" />
                          <span>Research Reports</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {researchSessions.length === 0 ? (
                          <div className="text-center py-8">
                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">No research reports yet</h3>
                            <p className="text-muted-foreground mb-4">
                              Launch Insights Engine to generate research reports
                            </p>
                            <Link to="/research">
                              <Button className="flex items-center space-x-2">
                                <Play className="h-4 w-4" />
                                <span>Launch Insights Engine</span>
                              </Button>
                            </Link>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {researchSessions.slice(0, 5).map((session) => (
                              <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border">
                                <div className="flex-1">
                                  <h4 className="font-medium">{session.survey_name || 'Research Survey'}</h4>
                                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                                    <span>{formatDate(session.created_at)}</span>
                                    <Badge className={getStatusColor(session.status)}>
                                      {session.status}
                                    </Badge>
                                  </div>
                                </div>
                                <Link to={`/research-results/${session.id}`}>
                                  <Button variant="outline" size="sm">
                                    View Report
                                  </Button>
                                </Link>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* 1-on-1 Conversations */}
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <MessageSquare className="h-5 w-5" />
                          <span>1-on-1 Conversations</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {conversations.length === 0 ? (
                          <div className="text-center py-8">
                            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
                            <p className="text-muted-foreground mb-4">
                              Start your first research conversation with personas
                            </p>
                            <Link to="/research">
                              <Button className="flex items-center space-x-2">
                                <Play className="h-4 w-4" />
                                <span>Start Research</span>
                              </Button>
                            </Link>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {conversations.slice(0, 5).map((conversation) => (
                              <div key={conversation.id} className="flex items-center justify-between p-3 rounded-lg border">
                                <div className="flex-1">
                                  <h4 className="font-medium">{conversation.title}</h4>
                                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                                    <span>{formatDate(conversation.updated_at)}</span>
                                    {conversation.persona_ids.length > 0 && (
                                      <span>{conversation.persona_ids.length} personas</span>
                                    )}
                                    {conversation.tags.length > 0 && (
                                      <div className="flex space-x-1">
                                        {conversation.tags.slice(0, 2).map((tag, index) => (
                                          <Badge key={index} variant="secondary" className="text-xs">
                                            {tag}
                                          </Badge>
                                        ))}
                                        {conversation.tags.length > 2 && (
                                          <span className="text-xs">+{conversation.tags.length - 2} more</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <Link to={`/conversations/${conversation.id}`}>
                                  <Button variant="outline" size="sm">
                                    View
                                  </Button>
                                </Link>
                              </div>
                            ))}
                          </div>
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
