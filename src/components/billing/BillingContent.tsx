import { BillingOverviewCard } from "./BillingOverviewCard";
import { RecentActivity } from "./RecentActivity";
import { OverageWarningBanner } from "./OverageWarningBanner";
import { useState } from "react";

export function BillingContent() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2 font-plasmik">Billing</h1>
        <p className="text-muted-foreground text-lg">
          Manage your subscription, credits, and billing information.
        </p>
      </div>
      
      <div className="grid gap-6">
        <BillingOverviewCard 
          key={refreshTrigger}
          renderOverageWarning={(billingData) => (
            <OverageWarningBanner 
              billingData={billingData} 
              onRefresh={handleRefresh} 
            />
          )}
        />
        <RecentActivity />
      </div>
    </div>
  );
}