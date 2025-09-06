import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, CreditCard, Coins, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatDateString } from "@/lib/utils";

interface UsageRecord {
  usage_id: string;
  created_at: string;
  action_type: string;
  credits_spent: number;
  metadata: any;
}

interface TransactionRecord {
  transaction_id: string;
  created_at: string;
  type: string;
  amount_usd: number | null;
  credits_purchased: number | null;
  provider_ref: string | null;
}

export function RecentActivity() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<UsageRecord[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loadingUsage, setLoadingUsage] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = async () => {
    if (!user?.id) return;

    try {
      setLoadingUsage(true);
      setError(null);

      console.log("🔍 [ACTIVITY] Fetching recent usage for user:", user.id);

      const { data, error } = await supabase
        .from('billing_usage_log')
        .select('usage_id, created_at, action_type, credits_spent, metadata')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error("❌ [ACTIVITY] Usage query error:", error);
        throw new Error(error.message);
      }

      console.log("✅ [ACTIVITY] Usage query result:", data);
      setUsage(data || []);

    } catch (err) {
      console.error("❌ [ACTIVITY] Error fetching usage:", err);
      setError(err instanceof Error ? err.message : 'Failed to load usage data');
    } finally {
      setLoadingUsage(false);
    }
  };

  const fetchTransactions = async () => {
    if (!user?.id) return;

    try {
      setLoadingTransactions(true);
      setError(null);

      console.log("🔍 [ACTIVITY] Fetching recent transactions for user:", user.id);

      const { data, error } = await supabase
        .from('billing_transactions')
        .select('transaction_id, created_at, type, amount_usd, credits_purchased, provider_ref')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error("❌ [ACTIVITY] Transactions query error:", error);
        throw new Error(error.message);
      }

      console.log("✅ [ACTIVITY] Transactions query result:", data);
      setTransactions(data || []);

    } catch (err) {
      console.error("❌ [ACTIVITY] Error fetching transactions:", err);
      setError(err instanceof Error ? err.message : 'Failed to load transaction data');
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    fetchUsage();
    fetchTransactions();
  }, [user?.id]);

  const formatActionType = (actionType: string) => {
    return actionType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatTransactionType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error loading activity: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="usage" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="usage" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Usage
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Transactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="usage" className="space-y-4">
            {loadingUsage ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2 text-muted-foreground">Loading usage...</span>
              </div>
            ) : usage.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No usage activity yet
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead className="text-right">Credits</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usage.map((record) => (
                      <TableRow key={record.usage_id}>
                        <TableCell className="text-sm">
                          {formatDateString(record.created_at)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatActionType(record.action_type)}
                        </TableCell>
                        <TableCell className="text-right text-destructive">
                          -{record.credits_spent}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            {loadingTransactions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2 text-muted-foreground">Loading transactions...</span>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions yet
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Credits</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((record) => (
                      <TableRow key={record.transaction_id}>
                        <TableCell className="text-sm">
                          {formatDateString(record.created_at)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatTransactionType(record.type)}
                        </TableCell>
                        <TableCell className="text-right">
                          {record.amount_usd ? `$${record.amount_usd}` : '—'}
                        </TableCell>
                        <TableCell className="text-right text-primary">
                          {record.credits_purchased ? `+${record.credits_purchased}` : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}