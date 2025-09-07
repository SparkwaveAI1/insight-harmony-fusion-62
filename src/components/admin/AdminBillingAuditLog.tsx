import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Download, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

// Get base URL for functions
const SUPABASE_URL = "https://wgerdrdsuusnrdnwwelt.supabase.co";

interface AuditLogEntry {
  id: string;
  user_id: string;
  user_email: string;
  type: string;
  amount_usd?: number;
  credits_purchased?: number;
  credits_delta?: number;
  provider?: string;
  source?: string;
  status?: string;
  metadata?: any;
  created_at: string;
  source_table: 'transaction' | 'ledger';
}

interface AuditResponse {
  data: AuditLogEntry[];
  next_cursor?: string;
  has_more: boolean;
}

export function AdminBillingAuditLog() {
  const [auditData, setAuditData] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    user_filter: '',
    start_date: '',
    end_date: '',
    event_type: 'all'
  });

  const fetchAuditLog = async () => {
    try {
      setLoading(true);
      console.log('🔍 [AUDIT] Fetching audit log with filters:', filters);

      const session = (await supabase.auth.getSession()).data.session;
      if (!session?.access_token) {
        console.error('❌ [AUDIT] No valid session found');
        return;
      }

      // Normalize dates to UTC for consistency
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          if (key.includes('date') && value) {
            // Ensure UTC format for date filters
            queryParams.append(key, new Date(value).toISOString());
          } else {
            queryParams.append(key, value);
          }
        }
      });
      queryParams.append('limit', '100');
      
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/admin-audit-log?${queryParams.toString()}`,
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

      console.log('✅ [AUDIT] Audit log data received:', data);
      setAuditData(data.data || []);
    } catch (error) {
      console.error('❌ [AUDIT] Failed to fetch audit log:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCsv = () => {
    const headers = [
      'Date',
      'User Email',
      'User ID', 
      'Event Type',
      'Amount USD',
      'Credits',
      'Provider/Source',
      'Status',
      'Details'
    ];

    const csvData = auditData.map(entry => [
      format(new Date(entry.created_at), 'yyyy-MM-dd HH:mm:ss'),
      entry.user_email,
      entry.user_id,
      entry.type,
      entry.amount_usd || '',
      entry.credits_purchased || entry.credits_delta || '',
      entry.provider || entry.source || '',
      entry.status || '',
      entry.metadata ? JSON.stringify(entry.metadata) : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billing-audit-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getEventBadge = (entry: AuditLogEntry) => {
    if (entry.source_table === 'transaction') {
      return <Badge variant="default">{entry.type}</Badge>;
    } else {
      const variant = entry.source === 'admin_adjustment' ? 'destructive' : 'secondary';
      return <Badge variant={variant}>{entry.source}</Badge>;
    }
  };

  const formatCredits = (entry: AuditLogEntry) => {
    if (entry.credits_purchased) return `+${entry.credits_purchased}`;
    if (entry.credits_delta) return entry.credits_delta > 0 ? `+${entry.credits_delta}` : entry.credits_delta.toString();
    return '-';
  };

  useEffect(() => {
    fetchAuditLog();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Billing Audit Log
        </CardTitle>
        <CardDescription>
          View all billing transactions, credit adjustments, and subscription events
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 border rounded-lg bg-muted/50">
          <div>
            <Label htmlFor="user-filter">User (Email/ID)</Label>
            <Input
              id="user-filter"
              placeholder="user@example.com"
              value={filters.user_filter}
              onChange={(e) => setFilters(prev => ({ ...prev, user_filter: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="event-type">Event Type</Label>
            <Select value={filters.event_type} onValueChange={(value) => setFilters(prev => ({ ...prev, event_type: value }))}>
              <SelectTrigger id="event-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="transactions">Transactions Only</SelectItem>
                <SelectItem value="adjustments">Adjustments Only</SelectItem>
                <SelectItem value="purchase">Purchases</SelectItem>
                <SelectItem value="subscription">Subscriptions</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={() => fetchAuditLog(true)} className="flex-1">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {auditData.length} records found
          </div>
          <Button
            onClick={exportToCsv}
            variant="outline"
            disabled={auditData.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Audit Table */}
        <div className="border rounded-lg">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading audit log...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Amount USD</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Provider/Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No audit records found
                    </TableCell>
                  </TableRow>
                ) : (
                  auditData.map((entry) => (
                    <TableRow key={`${entry.source_table}-${entry.id}`}>
                      <TableCell>
                        <div className="font-mono text-xs">
                          {format(new Date(entry.created_at), 'MMM dd, HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[150px]">
                          <div className="text-sm font-medium truncate">
                            {entry.user_email}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono truncate">
                            {entry.user_id.slice(0, 8)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getEventBadge(entry)}
                      </TableCell>
                      <TableCell>
                        {entry.amount_usd ? `$${entry.amount_usd}` : '-'}
                      </TableCell>
                      <TableCell>
                        <span className={formatCredits(entry).startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                          {formatCredits(entry)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {entry.provider || entry.source || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {entry.status && (
                          <Badge variant={entry.status === 'settled' ? 'default' : 'secondary'}>
                            {entry.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {entry.metadata && (
                          <div className="text-xs text-muted-foreground max-w-[200px] truncate">
                            {typeof entry.metadata === 'object' 
                              ? Object.entries(entry.metadata).map(([k, v]) => `${k}: ${v}`).join(', ')
                              : entry.metadata.toString()}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}