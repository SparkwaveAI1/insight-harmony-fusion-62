import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, CreditCard, Calendar, ToggleLeft, ToggleRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDateString } from "@/lib/utils";
import { RecentActivity } from "../billing/RecentActivity";

interface BillingProfile {
  plan_name: string | null;
  price_usd: number | null;
  included_credits: number | null;
  renewal_date: string | null;
  auto_renew: boolean;
}

interface UserBillingDetailProps {
  userId: string;
  userEmail: string;
}

export function UserBillingDetail({ userId, userEmail }: UserBillingDetailProps) {
  const [profile, setProfile] = useState<BillingProfile | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserBillingData();
  }, [userId]);

  const fetchUserBillingData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 [ADMIN] Fetching billing data for user:", userId);

      // Fetch billing profile with plan details
      const { data: profileData, error: profileError } = await supabase
        .from('billing_profiles')
        .select(`
          renewal_date,
          auto_renew,
          billing_plans (
            name,
            price_usd,
            included_credits
          )
        `)
        .eq('user_id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error("❌ [ADMIN] Error fetching profile:", profileError);
        throw new Error(profileError.message);
      }

      // Fetch current balance
      const { data: balanceData, error: balanceError } = await supabase
        .from('billing_credit_balances')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (balanceError && balanceError.code !== 'PGRST116') {
        console.error("❌ [ADMIN] Error fetching balance:", balanceError);
      }

      const billingProfile: BillingProfile = {
        plan_name: profileData?.billing_plans?.name || null,
        price_usd: profileData?.billing_plans?.price_usd || null,
        included_credits: profileData?.billing_plans?.included_credits || null,
        renewal_date: profileData?.renewal_date || null,
        auto_renew: profileData?.auto_renew || false,
      };

      console.log("✅ [ADMIN] Billing profile:", billingProfile);
      console.log("✅ [ADMIN] Balance:", balanceData?.balance || 0);

      setProfile(billingProfile);
      setBalance(balanceData?.balance || 0);

    } catch (err) {
      console.error("❌ [ADMIN] Error fetching billing data:", err);
      setError(err instanceof Error ? err.message : 'Failed to load billing data');
      toast({
        description: "Failed to load user billing data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2 text-muted-foreground">Loading billing data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading billing data: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Plan Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Plan Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
              <p className="text-lg font-semibold">
                {profile?.plan_name || (
                  <Badge variant="secondary">No Plan</Badge>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Monthly Price</p>
              <p className="text-lg font-semibold">
                {profile?.price_usd ? `$${profile.price_usd}` : '—'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Included Credits</p>
              <p className="text-lg font-semibold">
                {profile?.included_credits || '0'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
              <p className="text-lg font-semibold text-primary">
                {balance} credits
              </p>
            </div>
          </div>

          {profile?.renewal_date && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Next Renewal</p>
                  <p className="font-medium">
                    {formatDateString(profile.renewal_date)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">Auto-renew:</p>
                  {profile.auto_renew ? (
                    <Badge variant="default" className="gap-1">
                      <ToggleRight className="h-3 w-3" />
                      Enabled
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <ToggleLeft className="h-3 w-3" />
                      Disabled
                    </Badge>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity - Reuse the component but for specific user */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Activity History</h3>
        <UserRecentActivity userId={userId} />
      </div>
    </div>
  );
}

// Wrapper component to pass userId to RecentActivity
interface UserRecentActivityProps {
  userId: string;
}

function UserRecentActivity({ userId }: UserRecentActivityProps) {
  // For this admin view, we'll create a simplified version showing both usage and transactions
  // Since RecentActivity is user-specific via auth, we'll inline the logic here
  const [usage, setUsage] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingUsage, setLoadingUsage] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  useEffect(() => {
    fetchUsageData();
    fetchTransactionData();
  }, [userId]);

  const fetchUsageData = async () => {
    try {
      setLoadingUsage(true);
      console.log("🔍 [ADMIN] Fetching usage for user:", userId);

      const { data, error } = await supabase
        .from('billing_usage_log')
        .select('usage_id, created_at, action_type, credits_spent, metadata')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error("❌ [ADMIN] Usage query error:", error);
        throw new Error(error.message);
      }

      console.log("✅ [ADMIN] Usage data:", data);
      setUsage(data || []);
    } catch (err) {
      console.error("❌ [ADMIN] Error fetching usage:", err);
    } finally {
      setLoadingUsage(false);
    }
  };

  const fetchTransactionData = async () => {
    try {
      setLoadingTransactions(true);
      console.log("🔍 [ADMIN] Fetching transactions for user:", userId);

      const { data, error } = await supabase
        .from('billing_transactions')
        .select('transaction_id, created_at, type, amount_usd, credits_purchased, provider_ref')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error("❌ [ADMIN] Transactions query error:", error);
        throw new Error(error.message);
      }

      console.log("✅ [ADMIN] Transaction data:", data);
      setTransactions(data || []);
    } catch (err) {
      console.error("❌ [ADMIN] Error fetching transactions:", err);
    } finally {
      setLoadingTransactions(false);
    }
  };

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Usage History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Usage (Last 10)</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingUsage ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : usage.length === 0 ? (
            <p className="text-center py-4 text-sm text-muted-foreground">No usage activity</p>
          ) : (
            <div className="space-y-2">
              {usage.map((record) => (
                <div key={record.usage_id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <p className="text-sm font-medium">{formatActionType(record.action_type)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateString(record.created_at)}
                    </p>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    -{record.credits_spent}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transactions History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Transactions (Last 5)</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingTransactions ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-center py-4 text-sm text-muted-foreground">No transactions</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((record) => (
                <div key={record.transaction_id} className="py-2 border-b last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">{formatTransactionType(record.type)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateString(record.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      {record.amount_usd && (
                        <p className="text-sm">${record.amount_usd}</p>
                      )}
                      {record.credits_purchased && (
                        <Badge variant="default" className="text-xs">
                          +{record.credits_purchased}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}