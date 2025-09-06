import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface BillingData {
  balance: number;
  plan_name: string | null;
  included_credits: number | null;
  used_this_period: number;
}

export function useBillingData() {
  const { user } = useAuth();
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBillingData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get balance
      const { data: balanceData } = await supabase
        .from('billing_credit_available')
        .select('available')
        .eq('user_id', user.id)
        .maybeSingle();

      // Get plan info
      const { data: planData } = await supabase
        .from('billing_profiles')
        .select(`
          billing_plans(
            name,
            included_credits
          )
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      // Get usage this month
      const { data: usageData } = await supabase
        .from('billing_usage_log')
        .select('credits_spent')
        .eq('user_id', user.id)
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
        .lt('created_at', new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString());

      const totalUsage = usageData?.reduce((sum, entry) => sum + (entry.credits_spent || 0), 0) || 0;

      const data: BillingData = {
        balance: balanceData?.available || 0,
        plan_name: planData?.billing_plans?.name || null,
        included_credits: planData?.billing_plans?.included_credits || null,
        used_this_period: totalUsage
      };

      setBillingData(data);
    } catch (error) {
      console.error("Error fetching billing data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, [user?.id]);

  return { billingData, loading, refetch: fetchBillingData };
}