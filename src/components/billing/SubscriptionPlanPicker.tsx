import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Check, CreditCard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface BillingPlan {
  plan_id: string;
  name: string;
  price_usd: number;
  included_credits: number;
}

interface SubscriptionPlanPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchaseComplete?: () => void;
}

export function SubscriptionPlanPicker({ 
  open, 
  onOpenChange, 
  onPurchaseComplete 
}: SubscriptionPlanPickerProps) {
  const { user } = useAuth();
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingPlans, setFetchingPlans] = useState(true);

  const fetchPlans = async () => {
    try {
      setFetchingPlans(true);
      console.log("🔍 [PLANS] Fetching available subscription plans");
      
      const { data, error } = await supabase
        .from('billing_plans')
        .select('plan_id, name, price_usd, included_credits')
        .eq('is_active', true)
        .in('name', ['Starter', 'Pro'])
        .order('price_usd', { ascending: true });

      if (error) {
        console.error("❌ [PLANS] Error fetching plans:", error);
        throw new Error(error.message);
      }

      console.log("✅ [PLANS] Fetched plans:", data);
      setPlans(data || []);
      
      // Auto-select first plan if available
      if (data && data.length > 0) {
        setSelectedPlanId(data[0].plan_id);
      }
    } catch (err) {
      console.error("❌ [PLANS] Failed to fetch plans:", err);
      toast({
        title: "Error",
        description: "Failed to load subscription plans. Please try again.",
        variant: "destructive",
      });
    } finally {
      setFetchingPlans(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchPlans();
    }
  }, [open]);

  const handleUpgrade = async () => {
    if (!user?.id || !selectedPlanId) {
      toast({
        title: "Error",
        description: "Please select a plan first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to subscribe");
      }

      console.log("🚀 [SUBSCRIPTION] Starting subscription checkout", {
        userId: user.id,
        planId: selectedPlanId,
        hasSession: !!session
      });

      const { data, error } = await supabase.functions.invoke('billing-checkout-subscription', {
        body: { userId: user.id, planId: selectedPlanId },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      console.log("📝 [SUBSCRIPTION] Edge function response:", { data, error });

      if (error) {
        console.error("❌ [SUBSCRIPTION] Edge function error:", error);
        throw new Error(error.message || "Failed to create checkout session");
      }

      if (!data?.ok || !data?.url) {
        console.error("❌ [SUBSCRIPTION] Invalid response:", data);
        throw new Error(data?.error || "Checkout failed - no URL returned");
      }

      console.log("🔗 [SUBSCRIPTION] Redirecting to Stripe:", data.url);
      
      // Open in new tab
      const stripeWindow = window.open(data.url, '_blank');
      if (!stripeWindow) {
        // Fallback if popup blocked
        toast({
          title: "Popup Blocked",
          description: "Please allow popups for this site, or we'll redirect you now.",
        });
        setTimeout(() => {
          window.location.href = data.url;
        }, 2000);
        return;
      }
      
      // Close dialog and refresh data
      onOpenChange(false);
      onPurchaseComplete?.();

      toast({
        title: "Redirecting to Stripe",
        description: "Opening subscription checkout in a new tab...",
      });

    } catch (err: any) {
      console.error("❌ [SUBSCRIPTION] Subscription checkout error:", err);
      toast({
        title: "Checkout Error",
        description: err.message || "Could not start subscription checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = plans.find(p => p.plan_id === selectedPlanId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Choose Your Plan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {fetchingPlans ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-muted-foreground">Loading plans...</span>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No subscription plans available
            </div>
          ) : (
            <div className="space-y-3">
              {plans.map((plan) => (
                <div
                  key={plan.plan_id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedPlanId === plan.plan_id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedPlanId(plan.plan_id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {plan.included_credits} credits included monthly
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${plan.price_usd}/mo</div>
                      {selectedPlanId === plan.plan_id && (
                        <Check className="h-4 w-4 text-primary ml-auto mt-1" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedPlan && (
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-sm">
                <div className="font-medium">{selectedPlan.name} Plan</div>
                <div className="text-muted-foreground">
                  ${selectedPlan.price_usd}/month • {selectedPlan.included_credits} credits
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpgrade}
              disabled={loading || !selectedPlanId || fetchingPlans}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Subscribe
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Credits for subscriptions are added after the payment invoice posts.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}