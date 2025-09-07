import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";
import { CreditPackPicker } from "./CreditPackPicker";
import { SubscriptionPlanPicker } from "./SubscriptionPlanPicker";

interface BillingData {
  balance: number;
  plan_name: string | null;
  included_credits: number | null;
  used_this_period: number;
}

interface OverageWarningBannerProps {
  billingData: BillingData;
  onRefresh?: () => void;
}

export function OverageWarningBanner({ billingData, onRefresh }: OverageWarningBannerProps) {
  const [showCreditPicker, setShowCreditPicker] = useState(false);
  const [showPlanPicker, setShowPlanPicker] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const { balance, included_credits, used_this_period } = billingData;

  // Calculate usage percentage
  const usagePercent = included_credits && included_credits > 0 
    ? (used_this_period / included_credits) * 100 
    : 0;

  console.log("📊 [OVERAGE] Billing data:", {
    balance,
    included_credits,
    used_this_period,
    usagePercent: usagePercent.toFixed(1) + "%"
  });

  // Determine which warning to show
  const showUsageWarning = included_credits > 0 && usagePercent >= 80;
  const showLowBalanceWarning = balance < 20;

  // Don't show if dismissed or no warnings needed
  if (isDismissed || (!showUsageWarning && !showLowBalanceWarning)) {
    return null;
  }

  const warningMessage = showUsageWarning
    ? `You've used ${usagePercent.toFixed(0)}% of your monthly credits`
    : `Only ${balance} credits remaining`;

  const warningDescription = showUsageWarning
    ? "Consider upgrading your plan or purchasing additional credits before your allowance runs out."
    : "Your credit balance is low. Purchase more credits to continue using the platform.";

  console.log("⚠️ [OVERAGE] Showing warning:", {
    type: showUsageWarning ? "usage" : "balance",
    message: warningMessage
  });

  return (
    <>
      <Alert className="border-warning bg-warning/5">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <div className="flex-1">
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="font-medium text-warning-foreground">{warningMessage}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {warningDescription}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreditPicker(true)}
              >
                Buy Credits
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowPlanPicker(true)}
              >
                Upgrade Plan
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDismissed(true)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </div>
      </Alert>

      {/* Credit Pack Picker */}
      {showCreditPicker && (
        <CreditPackPicker
          open={showCreditPicker}
          onOpenChange={setShowCreditPicker}
          onPurchaseComplete={() => {
            setShowCreditPicker(false);
            onRefresh?.();
          }}
        />
      )}

      {/* Subscription Plan Picker */}
      {showPlanPicker && (
        <SubscriptionPlanPicker
          open={showPlanPicker}
          onOpenChange={setShowPlanPicker}
          onPurchaseComplete={() => {
            setShowPlanPicker(false);
            onRefresh?.();
          }}
        />
      )}
    </>
  );
}