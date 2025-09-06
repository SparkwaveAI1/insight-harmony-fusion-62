import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CreditCard, TrendingUp, Loader2, Calendar, Coins } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatDateString } from "@/lib/utils";

interface BillingData {
  balance: number;
  plan_name: string | null;
  included_credits: number | null;
  price_usd: number | null;
  renewal_date: string | null;
  auto_renew: boolean | null;
  used_this_period: number;
}

export function BillingOverviewCard() {
  const { user } = useAuth();
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchBillingData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("🔍 [BILLING] Fetching billing data for user:", user.id);

        // 1. Get balance (using the correct view name)
        console.log("🔍 [BILLING] Query 1: Getting credit balance");
        const { data: balanceData, error: balanceError } = await supabase
          .from('billing_credit_available')
          .select('available')
          .eq('user_id', user.id)
          .maybeSingle();

        if (balanceError) {
          console.error("❌ [BILLING] Balance query error:", balanceError);
        } else {
          console.log("✅ [BILLING] Balance query result:", balanceData);
        }

        // 2. Get plan & renewal
        console.log("🔍 [BILLING] Query 2: Getting plan and renewal info");
        const { data: planData, error: planError } = await supabase
          .from('billing_profiles')
          .select(`
            renewal_date,
            auto_renew,
            billing_plans(
              name,
              included_credits,
              price_usd
            )
          `)
          .eq('user_id', user.id)
          .maybeSingle();

        if (planError) {
          console.error("❌ [BILLING] Plan query error:", planError);
        } else {
          console.log("✅ [BILLING] Plan query result:", planData);
        }

        // 3. Get usage-to-date (current month)
        console.log("🔍 [BILLING] Query 3: Getting usage for current period");
        const { data: usageData, error: usageError } = await supabase
          .from('billing_usage_log')
          .select('credits_spent')
          .eq('user_id', user.id)
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
          .lt('created_at', new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString());

        if (usageError) {
          console.error("❌ [BILLING] Usage query error:", usageError);
        } else {
          console.log("✅ [BILLING] Usage query result:", usageData);
        }

        // Calculate total usage
        const totalUsage = usageData?.reduce((sum, entry) => sum + (entry.credits_spent || 0), 0) || 0;
        console.log("📊 [BILLING] Total usage calculated:", totalUsage);

        // Combine data
        const combinedData: BillingData = {
          balance: balanceData?.available || 0,
          plan_name: planData?.billing_plans?.name || null,
          included_credits: planData?.billing_plans?.included_credits || null,
          price_usd: planData?.billing_plans?.price_usd || null,
          renewal_date: planData?.renewal_date || null,
          auto_renew: planData?.auto_renew || null,
          used_this_period: totalUsage
        };

        console.log("📋 [BILLING] Final combined data:", combinedData);
        setBillingData(combinedData);

      } catch (err) {
        console.error("❌ [BILLING] Error fetching billing data:", err);
        setError(err instanceof Error ? err.message : 'Failed to load billing data');
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, [user?.id]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Billing Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
            <div className="h-8 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Billing Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error loading billing data: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!billingData) {
    return null;
  }

  const planName = billingData.plan_name || "Free";
  const hasIncludedCredits = billingData.included_credits && billingData.included_credits > 0;
  const usagePercentage = hasIncludedCredits 
    ? Math.min((billingData.used_this_period / billingData.included_credits) * 100, 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Billing Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan Info */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Plan</p>
            <p className="text-lg font-semibold">
              {planName}
              {billingData.price_usd && (
                <span className="text-sm text-muted-foreground ml-2">
                  ${billingData.price_usd}/mo
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Credits */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Credits</p>
              <p className="text-lg font-semibold">{billingData.balance} available</p>
            </div>
          </div>
        </div>

        {/* Usage Meter */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Usage this month</p>
            <p className="text-sm font-medium">
              {billingData.used_this_period}
              {hasIncludedCredits && ` / ${billingData.included_credits}`} credits
            </p>
          </div>
          
          {hasIncludedCredits ? (
            <div className="space-y-1">
              <Progress value={usagePercentage} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">
                {Math.round(usagePercentage)}% used
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Usage this month: {billingData.used_this_period} credits
            </p>
          )}
        </div>

        {/* Renewal Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              Renews: {billingData.renewal_date ? formatDateString(billingData.renewal_date) : "—"}
            </span>
          </div>
          <span>
            Auto-renew: {billingData.auto_renew ? "On" : "Off"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button 
            size="sm" 
            onClick={() => console.log("TODO: Buy credits")}
            className="flex-1"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Buy Credits
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => console.log("TODO: Upgrade plan")}
            className="flex-1"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Upgrade Plan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}