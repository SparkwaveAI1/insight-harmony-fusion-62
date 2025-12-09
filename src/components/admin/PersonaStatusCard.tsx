import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, Database, GraduationCap, FileText } from "lucide-react";
import { usePersonaStats } from "@/hooks/usePersonaStats";

export function PersonaStatusCard() {
  const { stats, loading } = usePersonaStats(true); // true = count all users' personas

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Current Status
          </CardTitle>
          <p className="text-sm text-muted-foreground">Loading persona data...</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Current Status
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Overview of persona data completeness
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Total Personas:</span>
            </div>
            <span className="font-semibold text-primary">
              {stats.totalPersonas}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Missing Demographics:</span>
            </div>
            <span className={`font-semibold ${stats.missingDemographics > 0 ? 'text-destructive' : 'text-emerald-600'}`}>
              ~{stats.missingDemographics} personas
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Missing Knowledge Domains:</span>
            </div>
            <span className={`font-semibold ${stats.missingKnowledgeDomains > 0 ? 'text-orange-500' : 'text-emerald-600'}`}>
              ~{stats.missingKnowledgeDomains} personas
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Missing Education:</span>
            </div>
            <span className={`font-semibold ${stats.missingEducation > 0 ? 'text-amber-500' : 'text-emerald-600'}`}>
              ~{stats.missingEducation} personas
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Brief Descriptions:</span>
            </div>
            <span className={`font-semibold ${stats.briefDescriptions > 0 ? 'text-blue-500' : 'text-emerald-600'}`}>
              ~{stats.briefDescriptions} personas
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}