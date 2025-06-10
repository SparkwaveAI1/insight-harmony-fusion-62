
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const SupabaseDebug = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [user, setUser] = useState<any>(null);
  const [projectsCount, setProjectsCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Check auth
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        
        setUser(user);
        
        if (user) {
          // Try to fetch projects
          const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('*');
            
          if (projectsError) {
            console.error('Projects query error:', projectsError);
            setError(`Projects query failed: ${projectsError.message}`);
          } else {
            setProjectsCount(projects?.length || 0);
            console.log('Projects fetched successfully:', projects);
          }
        }
        
        setConnectionStatus('connected');
      } catch (err: any) {
        console.error('Supabase connection error:', err);
        setError(err.message || 'Unknown error');
        setConnectionStatus('error');
      }
    };

    checkConnection();
  }, []);

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Supabase Connection Status
          <Badge variant={connectionStatus === 'connected' ? 'default' : connectionStatus === 'error' ? 'destructive' : 'secondary'}>
            {connectionStatus}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <strong>User:</strong> {user ? `${user.email} (${user.id})` : 'Not authenticated'}
        </div>
        <div>
          <strong>Projects count:</strong> {projectsCount !== null ? projectsCount : 'Not checked'}
        </div>
        {error && (
          <div className="text-red-600">
            <strong>Error:</strong> {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
