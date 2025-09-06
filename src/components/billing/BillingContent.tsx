import { BillingOverviewCard } from "./BillingOverviewCard";
import { RecentActivity } from "./RecentActivity";

export function BillingContent() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2 font-plasmik">Billing</h1>
        <p className="text-muted-foreground text-lg">
          Manage your subscription, credits, and billing information.
        </p>
      </div>
      
      <div className="grid gap-6">
        <BillingOverviewCard />
        <RecentActivity />
      </div>
    </div>
  );
}