import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, RefreshCw, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { 
  getActiveResearchSessions, 
  resumeResearchSession, 
  ResearchSessionStatus 
} from '@/services/collections/researchSessionRecovery';

const SessionRecoveryDashboard: React.FC = () => {
  const [sessions, setSessions] = useState<ResearchSessionStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumingSessionId, setResumingSessionId] = useState<string | null>(null);

  useEffect(() => {
    loadActiveSessions();
    // Refresh every 30 seconds
    const interval = setInterval(loadActiveSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadActiveSessions = async () => {
    try {
      const activeSessions = await getActiveResearchSessions();
      setSessions(activeSessions);
    } catch (error) {
      console.error('Error loading active sessions:', error);
      toast.error('Failed to load session data');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeSession = async (sessionId: string) => {
    setResumingSessionId(sessionId);
    try {
      const result = await resumeResearchSession(sessionId);
      if (result.success) {
        toast.success('Research session resumed in background');
        loadActiveSessions(); // Refresh the list
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to resume session');
    } finally {
      setResumingSessionId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const calculateProgress = (session: ResearchSessionStatus) => {
    if (!session.progress) return 0;
    const { completed_responses, total_expected_responses } = session.progress;
    return total_expected_responses > 0 ? (completed_responses / total_expected_responses) * 100 : 0;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Research Sessions</CardTitle>
          <CardDescription>Loading active and recent sessions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Research Sessions</CardTitle>
        <CardDescription>
          Monitor and recover interrupted research sessions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No active or pending research sessions found.
          </p>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(session.status)}
                    <h4 className="font-medium">
                      {session.survey_name || 'Unnamed Survey'}
                    </h4>
                    <Badge className={getStatusColor(session.status)}>
                      {session.status}
                    </Badge>
                  </div>
                  
                  {(session.status === 'active' || session.status === 'pending') && (
                    <Button
                      size="sm"
                      onClick={() => handleResumeSession(session.id)}
                      disabled={resumingSessionId === session.id}
                    >
                      {resumingSessionId === session.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                      Resume
                    </Button>
                  )}
                </div>

                {session.progress && (
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>
                        {session.progress.completed_responses} / {session.progress.total_expected_responses} responses
                      </span>
                    </div>
                    <Progress value={calculateProgress(session)} className="h-2" />
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  <div>Session ID: {session.id}</div>
                  <div>Created: {new Date(session.created_at).toLocaleString()}</div>
                  {session.started_at && (
                    <div>Started: {new Date(session.started_at).toLocaleString()}</div>
                  )}
                  {session.completed_at && (
                    <div>Completed: {new Date(session.completed_at).toLocaleString()}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" onClick={loadActiveSessions} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionRecoveryDashboard;