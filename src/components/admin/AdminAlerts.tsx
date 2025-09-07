import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertTriangle, Bell, CheckCircle, X, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";

// Get base URL for functions
const SUPABASE_URL = "https://wgerdrdsuusnrdnwwelt.supabase.co";

interface AdminAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  user_id?: string;
  user_email?: string;
  metadata: any;
  status: 'active' | 'dismissed' | 'resolved';
  created_at: string;
  dismissed_at?: string;
  dismissed_by?: string;
}

export function AdminAlerts() {
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAlerts, setCheckingAlerts] = useState(false);
  const [filter, setFilter] = useState({
    status: 'active',
    severity: 'all'
  });

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      console.log('🔔 [ALERTS] Fetching alerts with filters:', filter);

      const session = (await supabase.auth.getSession()).data.session;
      if (!session?.access_token) {
        console.error('❌ [ALERTS] No valid session found');
        return;
      }

      const queryParams = new URLSearchParams();
      if (filter.status !== 'all') queryParams.append('status', filter.status);
      if (filter.severity !== 'all') queryParams.append('severity', filter.severity);
      queryParams.append('limit', '50');
      
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/admin-manage-alerts?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log('✅ [ALERTS] Alerts received:', data);
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('❌ [ALERTS] Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkForNewAlerts = async () => {
    try {
      setCheckingAlerts(true);
      console.log('🔍 [ALERTS] Checking for new alert conditions...');

      const session = (await supabase.auth.getSession()).data.session;
      if (!session?.access_token) {
        console.error('❌ [ALERTS] No valid session found');
        return;
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-check-alerts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ [ALERTS] Alert check completed:', data);
      
      if (data.newAlertsCount > 0) {
        // Refresh alerts list to show new alerts
        await fetchAlerts();
      }
    } catch (error) {
      console.error('❌ [ALERTS] Failed to check alerts:', error);
    } finally {
      setCheckingAlerts(false);
    }
  };

  const dismissAlert = async (alertId: string, action: 'dismiss' | 'resolve') => {
    try {
      console.log(`🔔 [ALERTS] ${action}ing alert:`, alertId);

      const session = (await supabase.auth.getSession()).data.session;
      if (!session?.access_token) {
        console.error('❌ [ALERTS] No valid session found');
        return;
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-manage-alerts`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ alertId, action })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log(`✅ [ALERTS] Alert ${action}ed successfully`);
      
      // Update local state
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: action === 'dismiss' ? 'dismissed' : 'resolved' }
          : alert
      ));
    } catch (error) {
      console.error(`❌ [ALERTS] Failed to ${action} alert:`, error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <Bell className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeDisplay = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  // Auto-check for alerts every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!checkingAlerts) {
        checkForNewAlerts();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [checkingAlerts]);

  const activeAlerts = alerts.filter(alert => alert.status === 'active');
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical');

  return (
    <div className="space-y-6">
      {/* Alert Summary Banner */}
      {criticalAlerts.length > 0 && (
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{criticalAlerts.length} critical alert{criticalAlerts.length !== 1 ? 's' : ''}</strong> require immediate attention!
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Admin Alerts
                {activeAlerts.length > 0 && (
                  <Badge variant="destructive">{activeAlerts.length}</Badge>
                )}
              </CardTitle>
              <CardDescription>
                System alerts and notifications for proactive monitoring
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={checkForNewAlerts}
                disabled={checkingAlerts}
                variant="outline"
                size="sm"
              >
                {checkingAlerts ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Check Alerts
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="flex gap-4">
            <Select value={filter.status} onValueChange={(value) => setFilter(prev => ({ ...prev, status: value }))}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="all">All Status</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filter.severity} onValueChange={(value) => setFilter(prev => ({ ...prev, severity: value }))}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Alerts List */}
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading alerts...</span>
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No alerts found</p>
                <p className="text-sm">The system is running smoothly!</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <Card key={alert.id} className={`${alert.severity === 'critical' ? 'border-red-500' : alert.severity === 'high' ? 'border-orange-500' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                          {getSeverityIcon(alert.severity)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={getSeverityColor(alert.severity)}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">
                              {getTypeDisplay(alert.type)}
                            </Badge>
                            {alert.status !== 'active' && (
                              <Badge variant="secondary">
                                {alert.status}
                              </Badge>
                            )}
                          </div>
                          <p className="font-medium mb-1">{alert.message}</p>
                          {alert.user_email && (
                            <p className="text-sm text-muted-foreground">
                              User: {alert.user_email}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>
                              {format(new Date(alert.created_at), 'MMM dd, HH:mm')}
                            </span>
                            {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                              <span>
                                {Object.entries(alert.metadata).map(([key, value]) => 
                                  `${key}: ${value}`
                                ).join(' • ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {alert.status === 'active' && (
                        <div className="flex items-center gap-1 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => dismissAlert(alert.id, 'resolve')}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Resolve
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => dismissAlert(alert.id, 'dismiss')}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Dismiss
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}