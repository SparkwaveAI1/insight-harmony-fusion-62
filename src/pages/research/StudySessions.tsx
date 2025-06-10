
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, ArrowLeft, Play, Trash2, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { structuredStudyService, StructuredStudySession } from "@/services/structuredStudy/structuredStudyService";
import { toast } from "sonner";

const StudySessions = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<StructuredStudySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const userSessions = await structuredStudyService.getUserSessions();
      setSessions(userSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeSession = (sessionId: string) => {
    navigate(`/research/setup/structured?session=${sessionId}`);
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      const success = await structuredStudyService.deleteSession(sessionId);
      if (success) {
        toast.success('Session deleted successfully');
        loadSessions();
      } else {
        toast.error('Failed to delete session');
      }
    }
  };

  const getStepName = (step: number) => {
    const steps = ['Study Goals', 'Research Format', 'Audience', 'Output Goals', 'Review'];
    return steps[step - 1] || 'Unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'launched': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <div className="relative flex min-h-svh flex-col">
            <Header />
            <main className="flex-1 min-h-0">
              <div className="container h-full flex flex-col">
                <div className="flex items-center justify-between mb-8 pt-24 flex-shrink-0">
                  <SidebarTrigger className="hidden md:flex" />
                </div>
                
                <div className="flex-1 max-w-6xl mx-auto w-full">
                  <div className="mb-6">
                    <Link to="/research">
                      <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Research
                      </Button>
                    </Link>
                  </div>

                  <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center bg-primary/20 px-4 py-2 rounded-full mb-4">
                      <FlaskConical className="h-5 w-5 text-primary mr-2" />
                      <span className="text-sm font-medium text-primary">Study Sessions</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-4 font-plasmik">Your Study Sessions</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                      Resume or manage your structured study sessions
                    </p>
                  </div>

                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-3">Loading sessions...</span>
                    </div>
                  ) : sessions.length === 0 ? (
                    <Card className="p-8 text-center">
                      <FlaskConical className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Study Sessions Yet</h3>
                      <p className="text-muted-foreground mb-6">
                        Create your first structured study session to get started
                      </p>
                      <Button onClick={() => navigate('/research/setup/structured')}>
                        Start New Study
                      </Button>
                    </Card>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {sessions.map((session) => (
                        <Card key={session.id} className="p-6 hover:shadow-lg transition-shadow">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                                {session.title || 'Untitled Study'}
                              </h3>
                              <Badge className={`text-xs ${getStatusColor(session.status)}`}>
                                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                              </Badge>
                            </div>
                          </div>

                          <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              Step {session.current_step}/5: {getStepName(session.current_step)}
                            </div>
                            
                            {session.audience_definition?.selected_personas && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="h-4 w-4" />
                                {session.audience_definition.selected_personas.length} personas selected
                              </div>
                            )}

                            <div className="text-xs text-muted-foreground">
                              Last updated: {new Date(session.updated_at).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleResumeSession(session.id)}
                              className="flex-1"
                              size="sm"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Resume
                            </Button>
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteSession(session.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  <div className="mt-8 text-center">
                    <Button 
                      onClick={() => navigate('/research/setup/structured')}
                      variant="outline"
                      size="lg"
                    >
                      <FlaskConical className="h-4 w-4 mr-2" />
                      Start New Study Session
                    </Button>
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

export default StudySessions;
