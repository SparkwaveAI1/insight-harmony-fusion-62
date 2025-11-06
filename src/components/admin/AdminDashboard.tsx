import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonaEnhancementTools } from "./PersonaEnhancementTools";
import { PersonaCompletenessAnalysis } from "./PersonaCompletenessAnalysis";
import { AdminBillingUsers } from "./AdminBillingUsers";
import { AdminBillingAuditLog } from "./AdminBillingAuditLog";
import { AdminBillingStats } from "./AdminBillingStats";
import { AdminAlerts } from "./AdminAlerts";
import { GrokPromptMonitor } from "../dashboard/GrokPromptMonitor";
import { PersonaTraitFiller } from "./PersonaTraitFiller";
import { PersonaJsonUpload } from "./PersonaJsonUpload";
import { PersonaJsonUploadHelp } from "./PersonaJsonUploadHelp";
import { PersonaSelectionInterface } from "./PersonaSelectionInterface";
import { PersonaStatsCards } from "../dashboard/PersonaStatsCards";
import { BatchThumbnailGenerator } from "./BatchThumbnailGenerator";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield } from "lucide-react";

// Admin emails - add yours here
const ADMIN_EMAILS = [
  "cumbucotrader@gmail.com",
  "scott@sparkwave-ai.com",
];

export function AdminDashboard() {
  const { user } = useAuth();

  // Check if user is admin
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert className="max-w-md">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Access denied. Admin privileges required.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Dashboard
          </CardTitle>
          <CardDescription>
            System administration and persona management tools
          </CardDescription>
        </CardHeader>
      </Card>


      {/* Persona Stats Cards */}
      <PersonaStatsCards />

      {/* Admin Alerts */}
      <AdminAlerts />

      {/* Batch Thumbnail Generator */}
      <BatchThumbnailGenerator />

      {/* Grok Prompt Monitor */}
      <GrokPromptMonitor />

      {/* Admin Billing Stats */}
      <AdminBillingStats />

      {/* Persona JSON Upload */}
      <div className="grid gap-6 md:grid-cols-2">
        <PersonaJsonUpload />
        <PersonaJsonUploadHelp />
      </div>

      {/* Persona Trait Filler */}
      <PersonaTraitFiller />

      {/* Admin Billing Users */}
      <AdminBillingUsers />

      {/* Admin Billing Audit Log */}
      <AdminBillingAuditLog />
    </div>
  );
}