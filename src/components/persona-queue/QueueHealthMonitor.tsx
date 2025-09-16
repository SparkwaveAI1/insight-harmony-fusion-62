import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, CheckCircle, Clock, Play } from 'lucide-react';
import { QueueHealthStatus, getQueueHealthStatus, fixOrphanedPersonaQueueItems } from '@/services/queueHealthService';
import { useToast } from '@/hooks/use-toast';

interface QueueHealthMonitorProps {
  onRefresh: () => void;
  refreshing?: boolean;
}

export const QueueHealthMonitor: React.FC<QueueHealthMonitorProps> = ({ onRefresh, refreshing = false }) => {
  const [healthStatus, setHealthStatus] = useState<QueueHealthStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState(false);
  const { toast } = useToast();

  const loadHealthStatus = async () => {
    try {
      setLoading(true);
      const status = await getQueueHealthStatus();
      setHealthStatus(status);
    } catch (error) {
      console.error('Error loading queue health:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFixOrphaned = async () => {
    try {
      setFixing(true);
      await fixOrphanedPersonaQueueItems();
      toast({
        title: "Success",
        description: "Fixed orphaned persona queue items",
      });
      loadHealthStatus();
      onRefresh();
    } catch (error) {
      console.error('Error fixing orphaned items:', error);
      toast({
        title: "Error",
        description: "Failed to fix orphaned items",
        variant: "destructive",
      });
    } finally {
      setFixing(false);
    }
  };

  useEffect(() => {
    loadHealthStatus();
  }, []);

  if (!healthStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Queue Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const isHealthy = healthStatus.total_stuck === 0;
  const hasProcessing = healthStatus.total_processing > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isHealthy ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          )}
          Queue Health
          <Button
            variant="ghost"
            size="sm"
            onClick={loadHealthStatus}
            disabled={loading}
            className="ml-auto"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Pending</div>
            <Badge variant="secondary" className="w-full justify-center">
              <Play className="h-3 w-3 mr-1" />
              {healthStatus.total_pending}
            </Badge>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Processing</div>
            <Badge 
              variant={hasProcessing ? "default" : "secondary"} 
              className="w-full justify-center"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${hasProcessing ? 'animate-spin' : ''}`} />
              {healthStatus.total_processing}
            </Badge>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Stuck</div>
            <Badge 
              variant={healthStatus.total_stuck > 0 ? "destructive" : "secondary"} 
              className="w-full justify-center"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              {healthStatus.total_stuck}
            </Badge>
          </div>
        </div>

        {healthStatus.total_stuck > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              Oldest stuck: <strong>{healthStatus.oldest_stuck_item}</strong>
            </div>
            {healthStatus.processing_time_minutes && (
              <div className="text-sm text-muted-foreground">
                Processing for: <strong>{Math.floor(healthStatus.processing_time_minutes)}m</strong>
              </div>
            )}
            <Button
              onClick={handleFixOrphaned}
              disabled={fixing}
              size="sm"
              variant="outline"
              className="w-full"
            >
              {fixing ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                  Fixing...
                </>
              ) : (
                'Fix Orphaned Items'
              )}
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={onRefresh}
            disabled={refreshing}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            {refreshing ? (
              <>
                <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              'Refresh Queue'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};