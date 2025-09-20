import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  CheckCircle, 
  XCircle, 
  ChevronDown, 
  ChevronRight,
  AlertTriangle,
  Users,
  Brain,
  MessageSquare,
  ArrowRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { validatePersona } from "@/services/v4-persona/v4PersonaValidation";

interface PersonaMigrationStatus {
  persona_id: string;
  name: string;
  needs_migration: boolean;
  missing_fields: string[];
  migration_score: number;
  has_political_narrative: boolean;
  has_prompt_shaping: boolean;
  passes_validation: boolean;
}

export function PersonaCompletenessAnalysis() {
  const [personas, setPersonas] = useState<PersonaMigrationStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIncomplete, setShowIncomplete] = useState(true);
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => {
    fetchPersonaCompleteness();
  }, []);

  // Helper function to check if required demographic fields are present
  const hasRequiredDemographicFields = (metadata: any): boolean => {
    if (!metadata || typeof metadata !== 'object') return false;
    
    const requiredFields = [
      'age', 'gender', 'race_ethnicity', 'education_level', 
      'occupation', 'employment_type', 'income_level', 
      'social_class_identity', 'marital_status'
    ];
    
    return requiredFields.every(field => 
      metadata[field] && metadata[field] !== 'Not specified' && metadata[field] !== ''
    );
  };

  const analyzeMigrationStatus = (persona: any): PersonaMigrationStatus => {
    const missingFields: string[] = [];
    let migrationScore = 0;
    const totalChecks = 3;

    const fullProfile = persona.full_profile || {};

    // Check for political_narrative field
    const hasPoliticalNarrative = !!fullProfile.political_narrative;
    if (hasPoliticalNarrative) {
      migrationScore++;
    } else {
      missingFields.push("Political Narrative");
    }

    // Check for prompt_shaping field
    const hasPromptShaping = !!fullProfile.prompt_shaping;
    if (hasPromptShaping) {
      migrationScore++;
    } else {
      missingFields.push("Prompt Shaping");
    }

    // Run full validation check
    const validation = validatePersona(fullProfile);
    const passesValidation = validation.isValid;
    if (passesValidation) {
      migrationScore++;
    } else {
      missingFields.push("Schema Validation");
    }

    const needsMigration = missingFields.length > 0;

    return {
      persona_id: persona.persona_id,
      name: persona.name,
      needs_migration: needsMigration,
      missing_fields: missingFields,
      migration_score: Math.round((migrationScore / totalChecks) * 100),
      has_political_narrative: hasPoliticalNarrative,
      has_prompt_shaping: hasPromptShaping,
      passes_validation: passesValidation
    };
  };

  const fetchPersonaCompleteness = async () => {
    try {
      setLoading(true);
      
      const { data: personasData, error } = await supabase
        .from('v4_personas')
        .select('persona_id, name, full_profile, is_public')
        .order('name');

      if (error) {
        console.error('Error fetching personas:', error);
        toast.error('Failed to fetch persona data');
        return;
      }

      const analyzedPersonas = personasData.map(analyzeMigrationStatus);
      setPersonas(analyzedPersonas);
      
    } catch (error) {
      console.error('Error analyzing personas:', error);
      toast.error('Failed to analyze persona completeness');
    } finally {
      setLoading(false);
    }
  };

  const migratedPersonas = personas.filter(p => !p.needs_migration);
  const needsMigrationPersonas = personas.filter(p => p.needs_migration);
  const averageMigrationScore = personas.length > 0 
    ? Math.round(personas.reduce((sum, p) => sum + p.migration_score, 0) / personas.length)
    : 0;

  const getComponentIcon = (field: string) => {
    switch (field) {
      case "Political Narrative":
        return <Brain className="h-3 w-3" />;
      case "Prompt Shaping":
        return <MessageSquare className="h-3 w-3" />;
      case "Schema Validation":
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <AlertTriangle className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Persona Completeness Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Analyzing personas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRight className="h-5 w-5" />
          V4 Migration Progress Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{personas.length}</div>
            <div className="text-sm text-muted-foreground">Total Personas</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{migratedPersonas.length}</div>
            <div className="text-sm text-muted-foreground">Migrated</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{needsMigrationPersonas.length}</div>
            <div className="text-sm text-muted-foreground">Needs Migration</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{averageMigrationScore}%</div>
            <div className="text-sm text-muted-foreground">Avg. Progress</div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex gap-2">
          <Button
            variant={showIncomplete ? "default" : "outline"}
            size="sm"
            onClick={() => setShowIncomplete(!showIncomplete)}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Needs Migration ({needsMigrationPersonas.length})
          </Button>
          <Button
            variant={showComplete ? "default" : "outline"}
            size="sm"
            onClick={() => setShowComplete(!showComplete)}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Migrated ({migratedPersonas.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPersonaCompleteness}
          >
            Refresh Analysis
          </Button>
        </div>

        {/* Personas Needing Migration */}
        {showIncomplete && needsMigrationPersonas.length > 0 && (
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center gap-2 w-full">
              <ChevronDown className="h-4 w-4" />
              <h3 className="text-lg font-medium text-orange-600">
                Personas Needing Migration ({needsMigrationPersonas.length})
              </h3>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-3">
              {needsMigrationPersonas.map((persona) => (
                <div key={persona.persona_id} className="border rounded-lg p-4 bg-orange-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">{persona.name}</span>
                      <Badge variant="outline">{persona.migration_score}% migrated</Badge>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {persona.missing_fields.map((field) => (
                      <Badge key={field} variant="destructive" className="text-xs">
                        {getComponentIcon(field)}
                        <span className="ml-1">{field}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Migrated Personas */}
        {showComplete && migratedPersonas.length > 0 && (
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 w-full">
              <ChevronRight className="h-4 w-4" />
              <h3 className="text-lg font-medium text-green-600">
                Migrated Personas ({migratedPersonas.length})
              </h3>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-3">
              {migratedPersonas.map((persona) => (
                <div key={persona.persona_id} className="border rounded-lg p-4 bg-green-50/50">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{persona.name}</span>
                    <Badge variant="outline" className="bg-green-100">100% migrated</Badge>
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {personas.length === 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No personas found in the system.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}