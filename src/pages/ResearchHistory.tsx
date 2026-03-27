import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Users, Calendar, FlaskConical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

interface ResearchSession {
  id: string;
  status: string;
  selected_personas: string[];
  created_at: string;
  updated_at: string;
  research_surveys: {
    name: string | null;
    description: string | null;
    project_id: string | null;
  } | null;
}

const statusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'completed': return 'default';
    case 'active': return 'secondary';
    case 'pending': return 'outline';
    default: return 'outline';
  }
};

const ResearchHistory: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ResearchSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadSessions(user.id);
    }
  }, [user]);

  const loadSessions = async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('research_survey_sessions')
        .select('id, status, selected_personas, created_at, updated_at, research_surveys(name, description, project_id)')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;
      setSessions((data as ResearchSession[]) || []);
    } catch (err) {
      console.error('Error loading research sessions:', err);
      setError('Failed to load research sessions.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch {
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
              <div className="container py-6 max-w-5xl">
                <div className="flex items-center justify-between mb-2">
                  <SidebarTrigger className="hidden md:flex" />
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 font-plasmik">Research History</h1>
                    <div className="w-32 h-1 bg-accent mb-2"></div>
                    <p className="text-muted-foreground">All your past research sessions</p>
                  </div>
                  <Button asChild>
                    <Link to="/research">
                      <Plus className="h-4 w-4 mr-2" />
                      New Research Session
                    </Link>
                  </Button>
                </div>

                {isLoading && (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}

                {error && (
                  <div className="text-center py-10 text-destructive">
                    <p>{error}</p>
                  </div>
                )}

                {!isLoading && !error && sessions.length === 0 && (
                  <div className="text-center py-20">
                    <FlaskConical className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h2 className="text-xl font-semibold mb-2">No research sessions yet</h2>
                    <p className="text-muted-foreground mb-6">
                      Start your first research session to see results here.
                    </p>
                    <Button asChild>
                      <Link to="/research">Start Research Session</Link>
                    </Button>
                  </div>
                )}

                {!isLoading && !error && sessions.length > 0 && (
                  <div className="grid gap-4">
                    {sessions.map((session) => {
                      const surveyName = session.research_surveys?.name || 'Untitled Survey';
                      const personaCount = Array.isArray(session.selected_personas)
                        ? session.selected_personas.length
                        : 0;

                      return (
                        <Card key={session.id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-lg truncate">{surveyName}</CardTitle>
                                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {formatDate(session.created_at)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3.5 w-3.5" />
                                    {personaCount} persona{personaCount !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <Badge variant={statusVariant(session.status)} className="capitalize">
                                  {session.status}
                                </Badge>
                                <Button asChild size="sm">
                                  <Link to={`/research/results/${session.id}`}>
                                    View Results
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      );
                    })}
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

export default ResearchHistory;
